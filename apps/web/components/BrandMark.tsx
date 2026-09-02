// Fe·26 brand mark (W2-368): tricolor tile, navy 24-spoke chakra in the
// white band, bold navy "Fe" centered on the chakra hub, "26" white-on-
// green as the cell footer. Same SVG as public/favicon.svg, inlined here
// so header/footer can render it without an extra image request.
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
      <rect x="0" y="0" width="64" height="21.33" fill="#FF9933" />
      <rect x="0" y="21.33" width="64" height="21.33" fill="#FFFFFF" />
      <rect x="0" y="42.67" width="64" height="21.33" fill="#138808" />
      <circle cx="32" cy="32" r="9.5" fill="none" stroke="#000080" strokeWidth="1" />
      <circle cx="32" cy="32" r="1.6" fill="#000080" />
      <line key="spoke-0" x1="37.00" y1="32.00" x2="41.50" y2="32.00" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-1" x1="36.83" y1="33.29" x2="41.18" y2="34.46" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-2" x1="36.33" y1="34.50" x2="40.23" y2="36.75" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-3" x1="35.54" y1="35.54" x2="38.72" y2="38.72" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-4" x1="34.50" y1="36.33" x2="36.75" y2="40.23" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-5" x1="33.29" y1="36.83" x2="34.46" y2="41.18" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-6" x1="32.00" y1="37.00" x2="32.00" y2="41.50" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-7" x1="30.71" y1="36.83" x2="29.54" y2="41.18" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-8" x1="29.50" y1="36.33" x2="27.25" y2="40.23" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-9" x1="28.46" y1="35.54" x2="25.28" y2="38.72" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-10" x1="27.67" y1="34.50" x2="23.77" y2="36.75" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-11" x1="27.17" y1="33.29" x2="22.82" y2="34.46" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-12" x1="27.00" y1="32.00" x2="22.50" y2="32.00" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-13" x1="27.17" y1="30.71" x2="22.82" y2="29.54" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-14" x1="27.67" y1="29.50" x2="23.77" y2="27.25" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-15" x1="28.46" y1="28.46" x2="25.28" y2="25.28" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-16" x1="29.50" y1="27.67" x2="27.25" y2="23.77" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-17" x1="30.71" y1="27.17" x2="29.54" y2="22.82" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-18" x1="32.00" y1="27.00" x2="32.00" y2="22.50" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-19" x1="33.29" y1="27.17" x2="34.46" y2="22.82" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-20" x1="34.50" y1="27.67" x2="36.75" y2="23.77" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-21" x1="35.54" y1="28.46" x2="38.72" y2="25.28" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-22" x1="36.33" y1="29.50" x2="40.23" y2="27.25" stroke="#000080" strokeWidth="0.9" />
      <line key="spoke-23" x1="36.83" y1="30.71" x2="41.18" y2="29.54" stroke="#000080" strokeWidth="0.9" />
      <text x="32" y="36.5" textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize="13" fill="#000080">Fe</text>
      <text x="32" y="58" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize="11" fill="#FFFFFF">26</text>
    </svg>
  )
}
