// Fe·26 brand mark (W2-368, revised per operator spec — no chakra/wheel):
// rounded-square tricolor tile, large bold navy "Fe" as the dominant
// centered symbol, small white "26" as the footer/atomic-number text in
// the green band. Same SVG as public/favicon.svg, inlined here so
// header/footer/Command Deck can render it without an extra image request.
export default function BrandMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Fe 26 brand mark"
      className={className}
    >
      <defs>
        <clipPath id="fe26-tile">
          <rect x="0" y="0" width="64" height="64" rx="10" ry="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#fe26-tile)">
        <rect x="0" y="0" width="64" height="21.33" fill="#FF9933" />
        <rect x="0" y="21.33" width="64" height="21.33" fill="#FFFFFF" />
        <rect x="0" y="42.67" width="64" height="21.33" fill="#138808" />
      </g>
      <text x="32" y="39" textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize="27" fill="#0B1F3A">Fe</text>
      <text x="32" y="58.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize="11" fill="#FFFFFF">26</text>
    </svg>
  )
}
