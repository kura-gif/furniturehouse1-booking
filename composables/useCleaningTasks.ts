import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type QueryConstraint
} from 'firebase/firestore'
import type { CleaningTask, ChecklistItem, CleaningPhoto, UsedSupply, Booking } from '~/types'

export const useCleaningTasks = () => {
  const { $db } = useNuxtApp()
  const { user, isAdmin } = useAuth()

  const tasks = ref<CleaningTask[]>([])
  const currentTask = ref<CleaningTask | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // デフォルトチェックリスト
  const defaultChecklist: Omit<ChecklistItem, 'id'>[] = [
    { label: 'ベッドシーツ交換', completed: false, isCustom: false },
    { label: '枕カバー交換', completed: false, isCustom: false },
    { label: 'タオル交換', completed: false, isCustom: false },
    { label: '床掃除', completed: false, isCustom: false },
    { label: 'トイレ掃除', completed: false, isCustom: false },
    { label: 'キッチン掃除', completed: false, isCustom: false },
    { label: 'ゴミ回収', completed: false, isCustom: false },
    { label: '備品チェック', completed: false, isCustom: false }
  ]

  /**
   * 予約確定時に清掃タスクを自動生成
   */
  const createCleaningTasks = async (booking: Booking): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const tasksRef = collection($db, 'cleaningTasks')

      // チェックイン日とチェックアウト日を取得（useBookings側ではstartDate/endDateとして保存されている場合もある）
      const checkInDate = (booking as any).startDate || booking.checkInDate
      const checkOutDate = (booking as any).endDate || booking.checkOutDate

      // チェックリストを新しい形式で作成
      const checklist = defaultChecklist.map(item => ({
        item: item.label,
        completed: false
      }))

      // チェックイン前タスク
      const preCheckinTask = {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        taskType: 'pre_checkin' as const,
        status: 'pending' as const,
        scheduledDate: checkInDate,
        estimatedDuration: 120, // 2時間
        checklist,
        suppliesUsed: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      // チェックアウト後タスク
      const postCheckoutTask = {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        taskType: 'post_checkout' as const,
        status: 'pending' as const,
        scheduledDate: checkOutDate,
        estimatedDuration: 180, // 3時間
        checklist,
        suppliesUsed: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      await Promise.all([
        addDoc(tasksRef, preCheckinTask),
        addDoc(tasksRef, postCheckoutTask)
      ])

      console.log('✅ 清掃タスク自動生成完了:', booking.bookingReference)
    } catch (e: any) {
      console.error('❌ 清掃タスク生成エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスク一覧を読み込み
   */
  const loadTasks = async (filters?: {
    supporterId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const tasksRef = collection($db, 'cleaningTasks')
      const constraints: QueryConstraint[] = [orderBy('scheduledDate', 'desc')]

      // フィルタ適用
      if (filters?.supporterId) {
        constraints.push(where('assignedTo', '==', filters.supporterId))
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status))
      }
      if (filters?.startDate) {
        constraints.push(where('scheduledDate', '>=', Timestamp.fromDate(filters.startDate)))
      }
      if (filters?.endDate) {
        constraints.push(where('scheduledDate', '<=', Timestamp.fromDate(filters.endDate)))
      }

      const q = query(tasksRef, ...constraints)
      const snapshot = await getDocs(q)

      tasks.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CleaningTask[]

      console.log('✅ タスク読み込み完了:', tasks.value.length, '件')
    } catch (e: any) {
      console.error('❌ タスク読み込みエラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 特定タスクを読み込み
   */
  const loadTask = async (taskId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        throw new Error('タスクが見つかりません')
      }

      currentTask.value = {
        id: taskDoc.id,
        ...taskDoc.data()
      } as CleaningTask

      console.log('✅ タスク読み込み完了:', taskId)
    } catch (e: any) {
      console.error('❌ タスク読み込みエラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスクにサポーターを割り当て
   */
  const assignTask = async (taskId: string, supporterId: string, supporterName: string): Promise<void> => {
    try {
      if (!isAdmin.value) {
        throw new Error('管理者のみ割り当て可能です')
      }

      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)

      // サポーター情報を取得して時給と交通費を設定（supportersコレクションから）
      const supporterRef = doc($db, 'supporters', supporterId)
      const supporterDoc = await getDoc(supporterRef)

      if (!supporterDoc.exists()) {
        throw new Error('サポーターが見つかりません')
      }

      const supporterData = supporterDoc.data()

      await updateDoc(taskRef, {
        assignedTo: supporterId,
        assignedToUid: supporterData.uid || '', // Firebase AuthのUID（セキュリティルール用）
        assignedToName: supporterName,
        status: 'assigned',
        'compensation.hourlyRate': supporterData.hourlyRate || 0,
        'compensation.transportationFee': supporterData.transportationFee || 0,
        updatedAt: Timestamp.now()
      })

      console.log('✅ サポーター割り当て完了:', supporterName)

      // タスク一覧を再読み込み
      if (tasks.value.length > 0) {
        await loadTasks()
      }
    } catch (e: any) {
      console.error('❌ サポーター割り当てエラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスクの割り当てを解除
   */
  const unassignTask = async (taskId: string): Promise<void> => {
    try {
      if (!isAdmin.value) {
        throw new Error('管理者のみ割り当て解除可能です')
      }

      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)

      await updateDoc(taskRef, {
        assignedTo: null,
        assignedToUid: null,
        assignedToName: null,
        status: 'pending',
        'compensation.hourlyRate': 0,
        'compensation.transportationFee': 0,
        updatedAt: Timestamp.now()
      })

      console.log('✅ サポーター割り当て解除完了')

      // タスク一覧を再読み込み
      if (tasks.value.length > 0) {
        await loadTasks()
      }
    } catch (e: any) {
      console.error('❌ サポーター割り当て解除エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスクステータス更新
   */
  const updateTaskStatus = async (taskId: string, status: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        status,
        updatedAt: Timestamp.now()
      })

      console.log('✅ タスクステータス更新:', status)
    } catch (e: any) {
      console.error('❌ タスクステータス更新エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスク開始
   */
  const startTask = async (taskId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        startedAt: Timestamp.now(),
        status: 'assigned',
        updatedAt: Timestamp.now()
      })

      console.log('✅ タスク開始記録完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        await loadTask(taskId)
      }
    } catch (e: any) {
      console.error('❌ タスク開始エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスク完了
   */
  const completeTask = async (taskId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        throw new Error('タスクが見つかりません')
      }

      const taskData = taskDoc.data() as CleaningTask
      const completedAt = Timestamp.now()

      // 作業時間を計算（開始時刻がある場合）
      let actualHours = 0
      let calculatedAmount = 0

      if (taskData.startedAt) {
        const startMs = taskData.startedAt.toMillis()
        const endMs = completedAt.toMillis()
        actualHours = (endMs - startMs) / (1000 * 60 * 60) // ミリ秒から時間に変換

        // 報酬計算
        const hourlyRate = taskData.compensation?.hourlyRate || 0
        const transportationFee = taskData.compensation?.transportationFee || 0
        calculatedAmount = (actualHours * hourlyRate) + transportationFee
      }

      await updateDoc(taskRef, {
        completedAt,
        actualHours,
        status: 'completed',
        'compensation.calculatedAmount': calculatedAmount,
        'compensation.isPaid': false,
        updatedAt: Timestamp.now()
      })

      console.log('✅ タスク完了記録:', { actualHours, calculatedAmount })

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        await loadTask(taskId)
      }
    } catch (e: any) {
      console.error('❌ タスク完了エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * チェックリスト更新
   */
  const updateChecklist = async (taskId: string, checklist: ChecklistItem[]): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        checklist,
        updatedAt: Timestamp.now()
      })

      console.log('✅ チェックリスト更新完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        currentTask.value.checklist = checklist
      }
    } catch (e: any) {
      console.error('❌ チェックリスト更新エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * カスタムチェックリスト項目を追加
   */
  const addCustomChecklistItem = async (taskId: string, label: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        throw new Error('タスクが見つかりません')
      }

      const taskData = taskDoc.data() as CleaningTask
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        label,
        completed: false,
        isCustom: true,
        createdBy: user.value?.uid,
        createdAt: Timestamp.now()
      }

      const updatedChecklist = [...taskData.checklist, newItem]

      await updateDoc(taskRef, {
        checklist: updatedChecklist,
        updatedAt: Timestamp.now()
      })

      console.log('✅ カスタム項目追加完了:', label)

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        currentTask.value.checklist = updatedChecklist
      }
    } catch (e: any) {
      console.error('❌ カスタム項目追加エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 写真を追加
   */
  const addPhoto = async (taskId: string, file: File): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      // Firebase Storageに画像をアップロード
      const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const storage = getStorage()
      const timestamp = Date.now()
      const storagePath = `cleaning-tasks/${taskId}/${timestamp}_${file.name}`
      const fileRef = storageRef(storage, storagePath)

      await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(fileRef)

      // タスクに写真情報を追加
      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        throw new Error('タスクが見つかりません')
      }

      const taskData = taskDoc.data() as CleaningTask
      const newPhoto: CleaningPhoto = {
        id: crypto.randomUUID(),
        url: downloadURL,
        storagePath,
        uploadedAt: Timestamp.now(),
        uploadedBy: user.value?.uid || ''
      }

      const updatedPhotos = [...taskData.photos, newPhoto]

      await updateDoc(taskRef, {
        photos: updatedPhotos,
        updatedAt: Timestamp.now()
      })

      console.log('✅ 写真アップロード完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        currentTask.value.photos = updatedPhotos
      }
    } catch (e: any) {
      console.error('❌ 写真アップロードエラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 管理者が追加写真をリクエスト
   */
  const requestMorePhotos = async (taskId: string): Promise<void> => {
    try {
      if (!isAdmin.value) {
        throw new Error('管理者のみ写真リクエスト可能です')
      }

      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        photoRequestedByAdmin: true,
        updatedAt: Timestamp.now()
      })

      console.log('✅ 写真リクエスト完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        currentTask.value.photoRequestedByAdmin = true
      }
    } catch (e: any) {
      console.error('❌ 写真リクエストエラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 備品使用を記録
   */
  const addSupplyUsage = async (taskId: string, supply: UsedSupply): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        throw new Error('タスクが見つかりません')
      }

      const taskData = taskDoc.data() as CleaningTask
      const updatedSupplies = [...taskData.usedSupplies, supply]

      await updateDoc(taskRef, {
        usedSupplies: updatedSupplies,
        updatedAt: Timestamp.now()
      })

      console.log('✅ 備品使用記録完了:', supply.supplyName)

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        currentTask.value.usedSupplies = updatedSupplies
      }
    } catch (e: any) {
      console.error('❌ 備品使用記録エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 報酬を支払い済みにマーク
   */
  const markAsPaid = async (taskId: string): Promise<void> => {
    try {
      if (!isAdmin.value) {
        throw new Error('管理者のみ支払い記録可能です')
      }

      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        'compensation.isPaid': true,
        'compensation.paidAt': Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      console.log('✅ 支払い記録完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        await loadTask(taskId)
      }
    } catch (e: any) {
      console.error('❌ 支払い記録エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * タスクを削除
   */
  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      if (!isAdmin.value) {
        throw new Error('管理者のみ削除可能です')
      }

      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      await deleteDoc(taskRef)

      console.log('✅ タスク削除完了')

      // タスク一覧から削除
      tasks.value = tasks.value.filter(t => t.id !== taskId)

      // 現在のタスクをクリア
      if (currentTask.value?.id === taskId) {
        currentTask.value = null
      }
    } catch (e: any) {
      console.error('❌ タスク削除エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * ノート更新
   */
  const updateNotes = async (taskId: string, notes: string, isAdminNote = false): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc($db, 'cleaningTasks', taskId)
      const updateData: any = {
        updatedAt: Timestamp.now()
      }

      if (isAdminNote) {
        if (!isAdmin.value) {
          throw new Error('管理者のみ管理者ノートを更新できます')
        }
        updateData.adminNotes = notes
      } else {
        updateData.notes = notes
      }

      await updateDoc(taskRef, updateData)

      console.log('✅ ノート更新完了')

      // 現在のタスクを更新
      if (currentTask.value?.id === taskId) {
        if (isAdminNote) {
          currentTask.value.adminNotes = notes
        } else {
          currentTask.value.notes = notes
        }
      }
    } catch (e: any) {
      console.error('❌ ノート更新エラー:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 単一タスクを取得（サポーター用）
   */
  const getTask = async (taskId: string): Promise<CleaningTask | null> => {
    try {
      const taskRef = doc($db, 'cleaningTasks', taskId)
      const taskDoc = await getDoc(taskRef)

      if (!taskDoc.exists()) {
        return null
      }

      return {
        id: taskDoc.id,
        ...taskDoc.data()
      } as CleaningTask
    } catch (e: any) {
      console.error('❌ タスク取得エラー:', e)
      throw e
    }
  }

  /**
   * サポーター別のタスク一覧を取得
   * セキュリティルールはassignedToUidでチェックするため、そちらでクエリする
   */
  const getTasksBySupporter = async (supporterId: string): Promise<CleaningTask[]> => {
    try {
      const tasksRef = collection($db, 'cleaningTasks')
      // セキュリティルールがassignedToUidでチェックするため、
      // uidでクエリを実行する（user.valueはFirebase AuthのUser）
      const supporterUid = user.value?.uid
      if (!supporterUid) {
        console.error('❌ サポーターのUIDが取得できません')
        return []
      }

      const q = query(
        tasksRef,
        where('assignedToUid', '==', supporterUid),
        orderBy('scheduledDate', 'desc')
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CleaningTask[]
    } catch (e: any) {
      console.error('❌ サポータータスク取得エラー:', e)
      throw e
    }
  }

  /**
   * タスクを更新（サポーター用）
   */
  const updateTask = async (taskId: string, data: Partial<CleaningTask>): Promise<void> => {
    try {
      const taskRef = doc($db, 'cleaningTasks', taskId)
      await updateDoc(taskRef, {
        ...data,
        updatedAt: Timestamp.now()
      })
      console.log('✅ タスク更新完了:', taskId)
    } catch (e: any) {
      console.error('❌ タスク更新エラー:', e)
      throw e
    }
  }

  /**
   * 全タスク一覧を取得（管理者用）
   */
  const getAllTasks = async (): Promise<CleaningTask[]> => {
    try {
      const tasksRef = collection($db, 'cleaningTasks')
      const q = query(tasksRef, orderBy('scheduledDate', 'desc'))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CleaningTask[]
    } catch (e: any) {
      console.error('❌ 全タスク取得エラー:', e)
      throw e
    }
  }

  return {
    tasks,
    currentTask,
    loading,
    error,
    createCleaningTasks,
    loadTasks,
    loadTask,
    assignTask,
    unassignTask,
    updateTaskStatus,
    startTask,
    completeTask,
    updateChecklist,
    addCustomChecklistItem,
    addPhoto,
    requestMorePhotos,
    addSupplyUsage,
    markAsPaid,
    deleteTask,
    updateNotes,
    getTask,
    getTasksBySupporter,
    updateTask,
    getAllTasks
  }
}
