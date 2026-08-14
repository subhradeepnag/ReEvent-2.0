import { RazorpayCheckoutOptions, RazorpayInstance } from '@/models/payment'

// The Razorpay checkout script attaches its constructor to the window at runtime
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

export {}
