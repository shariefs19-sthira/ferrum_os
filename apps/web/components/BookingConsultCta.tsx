import { healthyBookingUrl } from '../lib/bookingConfig'

export default function BookingConsultCta() {
  if (!healthyBookingUrl) return null

  return (
    <a
      href={healthyBookingUrl}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-ink transition hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent"
      data-book-consult
    >
      Book a consult
    </a>
  )
}
