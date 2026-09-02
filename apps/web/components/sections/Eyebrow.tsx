type EyebrowProps = {
  children: string
}

/** Relume tagline token: color from-scheme, font Body, weight Semibold, case UPPERCASE. */
export default function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
      {children}
    </p>
  )
}
