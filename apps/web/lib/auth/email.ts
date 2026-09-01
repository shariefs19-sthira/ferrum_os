// Resend integration for verify/reset emails (W2-326), with a dev
// fallback when RESEND_API_KEY is unset (no operator gate yet) — per
// the "ship stub if key missing" rule. The dev fallback returns the raw
// token in the API response instead of emailing it, clearly labeled, so
// the flow can be exercised end to end without a provisioned mailer.

export type SendEmailResult = { sent: boolean; devToken?: string }

async function sendViaResend(apiKey: string, to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ferrum OS <noreply@ferrumos.dev>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) throw new Error(`resend send failed: ${res.status}`)
}

export async function sendVerificationEmail(apiKey: string | undefined, email: string, token: string): Promise<SendEmailResult> {
  if (!apiKey) return { sent: false, devToken: token }
  await sendViaResend(
    apiKey,
    email,
    'Verify your Ferrum OS account',
    `<p>Confirm your email: token <code>${token}</code></p>`,
  )
  return { sent: true }
}

export async function sendResetEmail(apiKey: string | undefined, email: string, token: string): Promise<SendEmailResult> {
  if (!apiKey) return { sent: false, devToken: token }
  await sendViaResend(
    apiKey,
    email,
    'Reset your Ferrum OS password',
    `<p>Reset token: <code>${token}</code>. This expires in 1 hour.</p>`,
  )
  return { sent: true }
}
