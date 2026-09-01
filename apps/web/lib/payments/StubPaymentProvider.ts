import type {
  CreateOrderInput,
  CreateOrderResult,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  PaymentProvider,
} from './PaymentProvider'

/**
 * Used when RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not provisioned
 * (no operator gate yet) — ships a fully labeled simulated flow rather
 * than blocking the pipeline, per the "ship stub if key missing" rule.
 * No real order is created with any payment gateway; verification always
 * succeeds so the demo flow can be exercised end to end.
 */
export class StubPaymentProvider implements PaymentProvider {
  async createOrder(_input: CreateOrderInput): Promise<CreateOrderResult> {
    return {
      providerOrderId: `stub_order_${crypto.randomUUID()}`,
      mode: 'test',
      simulated: true,
    }
  }

  async verifyPaymentSignature(): Promise<boolean> {
    return true
  }

  async verifyWebhookSignature(): Promise<boolean> {
    return true
  }

  async createSubscription(_input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    return {
      providerSubscriptionId: `stub_sub_${crypto.randomUUID()}`,
      mode: 'test',
      simulated: true,
    }
  }

  async cancelSubscription(): Promise<boolean> {
    return true
  }
}
