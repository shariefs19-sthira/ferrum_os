import type {
  CreateOrderInput,
  CreateOrderResult,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  PaymentProvider,
} from './PaymentProvider'

/**
 * Real Razorpay integration via direct REST calls (not the official
 * Node SDK — the Workers runtime has no nodejs_compat flag enabled, and
 * the SDK's axios/Node-crypto dependencies aren't edge-safe). Signature
 * verification uses Web Crypto's HMAC-SHA256, which is natively
 * available in Workers.
 *
 * Test-mode only until an operator flips real secrets in and
 * docs/COMPLIANCE_GATE.md's Stage-2 sign-off is recorded — `mode` is
 * derived from the key prefix (`rzp_test_` vs `rzp_live_`), not a flag
 * this code sets itself.
 */
export class RazorpayProvider implements PaymentProvider {
  constructor(
    private readonly keyId: string,
    private readonly keySecret: string,
    private readonly webhookSecret?: string,
  ) {}

  private get mode(): 'test' | 'live' {
    return this.keyId.startsWith('rzp_live_') ? 'live' : 'test'
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const auth = btoa(`${this.keyId}:${this.keySecret}`)
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
      }),
    })
    if (!res.ok) {
      throw new Error(`razorpay order create failed: ${res.status}`)
    }
    const data = (await res.json()) as { id: string }
    return { providerOrderId: data.id, mode: this.mode, simulated: false }
  }

  async verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const expected = await hmacSha256Hex(this.keySecret, `${orderId}|${paymentId}`)
    return timingSafeEqual(expected, signature)
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    if (!this.webhookSecret) return false
    const expected = await hmacSha256Hex(this.webhookSecret, rawBody)
    return timingSafeEqual(expected, signature)
  }

  private authHeader(): string {
    return `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`
  }

  // Razorpay subscriptions need a plan_id first — plans aren't per-user,
  // so this creates one on demand rather than requiring an operator to
  // pre-provision plans in the Razorpay dashboard before test-mode can
  // be exercised at all. Not idempotent across calls (each call makes a
  // fresh plan) — acceptable for this Stage-1 test-mode surface, revisit
  // if/when this goes live.
  async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    const planRes = await fetch('https://api.razorpay.com/v1/plans', {
      method: 'POST',
      headers: { Authorization: this.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'monthly',
        interval: 1,
        item: { name: input.planName, amount: input.amountPaise, currency: input.currency },
      }),
    })
    if (!planRes.ok) throw new Error(`razorpay plan create failed: ${planRes.status}`)
    const plan = (await planRes.json()) as { id: string }

    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: this.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: plan.id, total_count: input.totalCount, customer_notify: 1 }),
    })
    if (!subRes.ok) throw new Error(`razorpay subscription create failed: ${subRes.status}`)
    const sub = (await subRes.json()) as { id: string }
    return { providerSubscriptionId: sub.id, mode: this.mode, simulated: false }
  }

  async cancelSubscription(providerSubscriptionId: string | null): Promise<boolean> {
    if (!providerSubscriptionId) return false
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${providerSubscriptionId}/cancel`, {
      method: 'POST',
      headers: { Authorization: this.authHeader(), 'Content-Type': 'application/json' },
    })
    return res.ok
  }
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
