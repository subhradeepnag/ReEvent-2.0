import { RazorpayCheckoutOptions, RazorpayHandlerResponse } from '@/models/payment'

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

// Cached so that repeated checkouts on the same page only ever inject the script once
let scriptPromise: Promise<void> | null = null

// Thrown when the user closes the checkout modal without paying — the caller can treat this as a no-op rather than an error
export class PaymentCancelledError extends Error {
  constructor() {
    super('Payment was cancelled')
    this.name = 'PaymentCancelledError'
  }
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout can only be loaded in the browser'))
  }
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null // allow a retry on the next attempt
      script.remove()
      reject(new Error('Failed to load the Razorpay checkout script'))
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

// Opens the Razorpay checkout modal and resolves with the payment details once the user has paid.
// Rejects with PaymentCancelledError if the user dismisses the modal, or a regular Error if the payment fails.
export async function openRazorpayCheckout(options: Omit<RazorpayCheckoutOptions, 'handler' | 'modal'>): Promise<RazorpayHandlerResponse> {
  await loadRazorpayScript()

  return new Promise<RazorpayHandlerResponse>((resolve, reject) => {
    let settled = false

    const checkout = new window.Razorpay({
      ...options,
      handler: (response) => {
        settled = true
        resolve(response)
      },
      modal: {
        // Razorpay fires this on both a manual close and after a failure, so only reject if nothing else settled first
        ondismiss: () => {
          if (settled) return
          settled = true
          reject(new PaymentCancelledError())
        },
      },
    })

    checkout.on('payment.failed', (response) => {
      if (settled) return
      settled = true
      reject(new Error(response.error?.description || response.error?.reason || 'Payment failed'))
    })

    checkout.open()
  })
}
