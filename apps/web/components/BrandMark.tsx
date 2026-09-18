// International Fe·26 brand mark: neutral deep-navy material tile with a
// single Ferrum-orange accent. No flag, national colour banding or country
// symbol is encoded in the product identity. Same SVG as public/favicon.svg.
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
        <linearGradient id="fe26-field" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#123A60" />
          <stop offset="1" stopColor="#07182B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="11" fill="url(#fe26-field)" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="8.5" fill="none" stroke="#4F7897" strokeOpacity="0.55" />
      <rect x="13" y="10" width="38" height="4" rx="2" fill="#FF9933" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize="29" fill="#FFFFFF">Fe</text>
      <text x="32" y="55" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize="10" fill="#FFB05F">26</text>
    </svg>
  )
}
