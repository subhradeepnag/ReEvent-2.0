export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'FREE' | 'FAILED'

export interface ActivityRegistration {
  id: string
  activityId: string
  userId: number
  status: RegistrationStatus
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  amountPaid: number | null
  paidAt: string | null
}
