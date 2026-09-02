type SectionHeadingProps = {
  as?: 'h1' | 'h2'
  children: string
  className?: string
}

/** Relume heading token: weight Semibold, letter-spacing Tight, case Default. */
export default function SectionHeading({ as = 'h2', children, className = '' }: SectionHeadingProps) {
  const Tag = as
  const size = as === 'h1' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl'
  return (
    <Tag className={`${size} text-balance font-semibold leading-tight tracking-relume-tight text-relume-ink ${className}`}>
      {children}
    </Tag>
  )
}
