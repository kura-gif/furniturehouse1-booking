export interface Review {
  id?: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  stayType?: string
  stayDate?: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

export interface ReviewFormData {
  rating: number
  comment: string
  stayType?: string
  stayDate?: string
}
