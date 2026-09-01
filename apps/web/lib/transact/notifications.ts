// Case-event notifications (W2-330) — reuses the Resend REST pattern
// from lib/auth/email.ts rather than a parallel mailer. Same dev
// fallback: without RESEND_API_KEY, returns the notification body
// instead of sending it, so the flow is exercisable without a
// provisioned mailer.

export type NotifyResult = { sent: boolean; devPreview?: string }

export async function sendCaseNotification(
  apiKey: string | undefined,
  toEmail: string,
  subject: string,
  body: string,
): Promise<NotifyResult> {
  if (!apiKey) return { sent: false, devPreview: body }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Ferrum OS <noreply@ferrumos.dev>', to: toEmail, subject, html: `<p>${body}</p>` }),
  })
  if (!res.ok) throw new Error(`resend send failed: ${res.status}`)
  return { sent: true }
}
