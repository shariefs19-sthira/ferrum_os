// Thin payment-provider abstraction (W2-324/W2-329) so a future Stripe
// rail (NRI/international payments) can be added post-launch without
// reworking worker.ts routes or the orders/payments schema — per the
// operator's explicit Razorpay-now/Stripe-later decision.

export type CreateOrderInput = {
  amountPaise: number
  currency: string
  receipt: string
}

export type CreateOrderResult = {
  providerOrderId: string | null
  mode: 'test' | 'live'
  simulated: boolean
}

export type CreateSubscriptionInput = {
  planName: string
  amountPaise: number
  currency: string
  totalCount: number
}

export type CreateSubscriptionResult = {
  providerSubscriptionId: string | null
  mode: 'test' | 'live'
  simulated: boolean
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean>
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>
  createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>
  cancelSubscription(providerSubscriptionId: string | null): Promise<boolean>
}
