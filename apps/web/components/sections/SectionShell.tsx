import { ReactNode } from 'react'

type SectionShellProps = {
  children: ReactNode
  /** Relume "Container border: on" — bordered container on the section itself. */
  bordered?: boolean
  /** Relume scheme background: white by default, F5F5F5 for the secondary scheme. */
  background?: 'surface' | 'surface-secondary'
  className?: string
}

export default function SectionShell({
  children,
  bordered = false,
  background = 'surface',
  className = '',
}: SectionShellProps) {
  const bg = background === 'surface-secondary' ? 'bg-relume-surface-secondary' : 'bg-relume-surface'
  const border = bordered ? 'border border-relume-border rounded-lg' : ''

  return (
    <section className={`${bg} py-16 sm:py-20 md:px-8 ${className}`}>
      <div className={`mx-auto max-w-7xl px-6 md:px-8 ${border}`}>{children}</div>
    </section>
  )
}
