import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import type { MaintenanceRecord, MaintenanceStatus } from '~/types'

export const useMaintenance = () => {
  const { $db } = useNuxtApp()

  // 全メンテナンス記録を取得
  const getAllMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const q = query(collection($db, 'maintenance'), orderBy('equipmentName', 'asc'))
      const querySnapshot = await getDocs(q)

      const records: MaintenanceRecord[] = []
      querySnapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        } as MaintenanceRecord)
      })

      return records
    } catch (error) {
      console.error('Get maintenance records error:', error)
      throw new Error('メンテナンス記録の取得に失敗しました')
    }
  }

  // メンテナンス記録を追加
  const createMaintenanceRecord = async (
    recordData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      // undefinedのフィールドを除去
      const cleanData: Record<string, unknown> = {
        equipmentName: recordData.equipmentName,
        lastMaintenanceDate: recordData.lastMaintenanceDate,
        status: recordData.status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      if (recordData.nextScheduledDate) cleanData.nextScheduledDate = recordData.nextScheduledDate
      if (recordData.description) cleanData.description = recordData.description
      if (recordData.performedBy) cleanData.performedBy = recordData.performedBy
      if (recordData.cost) cleanData.cost = recordData.cost

      const docRef = await addDoc(collection($db, 'maintenance'), cleanData)
      return docRef.id
    } catch (error) {
      console.error('Create maintenance record error:', error)
      throw new Error('メンテナンス記録の追加に失敗しました')
    }
  }

  // メンテナンス記録を更新
  const updateMaintenanceRecord = async (
    recordId: string,
    recordData: Partial<Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      // undefinedのフィールドを除去
      const cleanData: Record<string, unknown> = {
        updatedAt: Timestamp.now()
      }
      if (recordData.equipmentName !== undefined) cleanData.equipmentName = recordData.equipmentName
      if (recordData.lastMaintenanceDate !== undefined) cleanData.lastMaintenanceDate = recordData.lastMaintenanceDate
      if (recordData.nextScheduledDate !== undefined) cleanData.nextScheduledDate = recordData.nextScheduledDate
      if (recordData.status !== undefined) cleanData.status = recordData.status
      if (recordData.description !== undefined) cleanData.description = recordData.description
      if (recordData.performedBy !== undefined) cleanData.performedBy = recordData.performedBy
      if (recordData.cost !== undefined) cleanData.cost = recordData.cost

      const recordRef = doc($db, 'maintenance', recordId)
      await updateDoc(recordRef, cleanData)
    } catch (error) {
      console.error('Update maintenance record error:', error)
      throw new Error('メンテナンス記録の更新に失敗しました')
    }
  }

  // メンテナンスを記録（既存レコードを更新または新規作成）
  const logMaintenance = async (
    equipmentName: string,
    description: string,
    performedBy?: string,
    cost?: number,
    nextScheduledDate?: Date
  ): Promise<string> => {
    const records = await getAllMaintenanceRecords()
    const existingRecord = records.find(r => r.equipmentName === equipmentName)

    if (existingRecord) {
      await updateMaintenanceRecord(existingRecord.id, {
        lastMaintenanceDate: Timestamp.now(),
        nextScheduledDate: nextScheduledDate ? Timestamp.fromDate(nextScheduledDate) : undefined,
        status: 'good',
        description,
        performedBy,
        cost
      })
      return existingRecord.id
    } else {
      return await createMaintenanceRecord({
        equipmentName,
        lastMaintenanceDate: Timestamp.now(),
        nextScheduledDate: nextScheduledDate ? Timestamp.fromDate(nextScheduledDate) : undefined,
        status: 'good',
        description,
        performedBy,
        cost
      })
    }
  }

  // ステータスを更新
  const updateStatus = async (recordId: string, status: MaintenanceStatus): Promise<void> => {
    await updateMaintenanceRecord(recordId, { status })
  }

  // メンテナンス記録を削除
  const deleteMaintenanceRecord = async (recordId: string): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const recordRef = doc($db, 'maintenance', recordId)
      await deleteDoc(recordRef)
    } catch (error) {
      console.error('Delete maintenance record error:', error)
      throw new Error('メンテナンス記録の削除に失敗しました')
    }
  }

  // 要確認のメンテナンス記録を取得
  const getRecordsNeedingAttention = async (): Promise<MaintenanceRecord[]> => {
    const allRecords = await getAllMaintenanceRecords()
    return allRecords.filter(r => r.status === 'needs_attention' || r.status === 'broken')
  }

  return {
    getAllMaintenanceRecords,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    logMaintenance,
    updateStatus,
    deleteMaintenanceRecord,
    getRecordsNeedingAttention
  }
}
