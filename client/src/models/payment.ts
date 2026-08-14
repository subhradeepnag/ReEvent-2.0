import { ActivityRegistration } from './activityRegistration'

// Order details the server hands back after creating a Razorpay order for a paid activity
export interface RazorpayOrder {
  id: string
  amount: number // in paise
  currency: string
  key: string // public Razorpay key id, safe to expose to the browser
  activityTitle: string
}

// Response of POST /api/v1/activities/:id/join — free activities are registered immediately, paid ones need checkout
export type JoinActivityResponse = { type: 'free' } | { type: 'paid'; registration: ActivityRegistration; order: RazorpayOrder }

export interface VerifyPaymentResponse {
  success: boolean
  registrationId: string
}

// What the Razorpay checkout handler gives us once the user has paid — sent to the server for signature verification
export interface RazorpayHandlerResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  handler: (response: RazorpayHandlerResponse) => void
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

export interface RazorpayFailureResponse {
  error: {
    code?: string
    description?: string
    reason?: string
  }
}

export interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void
}
