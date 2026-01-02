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
import type { Amenity } from '~/config/amenities'

export const useAmenities = () => {
  const { $db } = useNuxtApp()

  // 全アメニティを取得
  const getAllAmenities = async (): Promise<Amenity[]> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const q = query(collection($db, 'amenities'), orderBy('category', 'asc'))
      const querySnapshot = await getDocs(q)

      const amenities: Amenity[] = []
      querySnapshot.forEach((doc) => {
        amenities.push({
          id: doc.id,
          ...doc.data()
        } as Amenity)
      })

      return amenities
    } catch (error) {
      console.error('Get amenities error:', error)
      throw new Error('アメニティの取得に失敗しました')
    }
  }

  // 利用可能なアメニティのみ取得
  const getAvailableAmenities = async (): Promise<Amenity[]> => {
    const allAmenities = await getAllAmenities()
    return allAmenities.filter(a => a.available)
  }

  // アメニティを追加
  const createAmenity = async (amenityData: Omit<Amenity, 'id'>): Promise<string> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const docRef = await addDoc(collection($db, 'amenities'), {
        ...amenityData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Create amenity error:', error)
      throw new Error('アメニティの追加に失敗しました')
    }
  }

  // アメニティを更新
  const updateAmenity = async (amenityId: string, amenityData: Partial<Amenity>): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const amenityRef = doc($db, 'amenities', amenityId)
      await updateDoc(amenityRef, {
        ...amenityData,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Update amenity error:', error)
      throw new Error('アメニティの更新に失敗しました')
    }
  }

  // アメニティを削除
  const deleteAmenity = async (amenityId: string): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const amenityRef = doc($db, 'amenities', amenityId)
      await deleteDoc(amenityRef)
    } catch (error) {
      console.error('Delete amenity error:', error)
      throw new Error('アメニティの削除に失敗しました')
    }
  }

  // アメニティの利用可能状態を切り替え
  const toggleAmenityAvailability = async (amenityId: string, available: boolean): Promise<void> => {
    await updateAmenity(amenityId, { available })
  }

  return {
    getAllAmenities,
    getAvailableAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    toggleAmenityAvailability
  }
}
