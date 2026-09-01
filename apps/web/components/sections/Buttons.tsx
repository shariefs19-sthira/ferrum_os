import Link from 'next/link'
import { ReactNode } from 'react'

type ButtonProps = {
  href: string
  children: ReactNode
}

/** Relume primary button: color Neutral, style Flat. */
export function PrimaryButton({ href, children }: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
    >
      {children}
    </Link>
  )
}

/** Relume secondary button: Neutral, treatment Bordered, border intensity Subtle. */
export function SecondaryButton({ href, children }: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-ink transition hover:bg-relume-surface-secondary"
    >
      {children}
    </Link>
  )
}
