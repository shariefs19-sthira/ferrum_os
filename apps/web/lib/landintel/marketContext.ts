export type MarketEvidenceStatus = 'SOURCE-VERIFIED' | 'INDICATIVE' | 'INFERRED' | 'UNKNOWN' | 'STALE'

export type MarketCapability = {
  id: string
  title: string
  decision: string
  evidence: string
  keywords: string[]
}

export type MarketMetadataField = {
  id: string
  label: string
  value: string
  status: MarketEvidenceStatus
}

export const marketEvidenceStates: MarketEvidenceStatus[] = [
  'SOURCE-VERIFIED',
  'INDICATIVE',
  'INFERRED',
  'UNKNOWN',
  'STALE',
]

export const marketCapabilities: MarketCapability[] = [
  {
    id: 'comparable-transactions',
    title: 'Comparable land transactions',
    decision: 'Benchmark the parcel against nearby recorded sale transactions of comparable size, zoning and use.',
    evidence: 'Registered sale-deed/registration data or a licensed comparable-transaction feed, with transaction date.',
    keywords: ['comparable sale', 'transaction', 'registration', 'benchmark'],
  },
  {
    id: 'guidance-value',
    title: 'Government guidance value',
    decision: 'Read the notified circle-rate / guidance value applicable to the parcel, as a statutory floor, not a market estimate.',
    evidence: 'Current state sub-registrar guidance-value notification for the parcel’s survey/sub-registration unit.',
    keywords: ['guidance value', 'circle rate', 'stamp duty valuation'],
  },
  {
    id: 'price-trend',
    title: 'Area price-trend direction',
    decision: 'Show a directional trend (rising/flat/falling) for the micro-market, never a fabricated forecast figure.',
    evidence: 'Multi-period comparable-transaction series or a licensed market-index feed for the same micro-market.',
    keywords: ['price trend', 'appreciation', 'market index'],
  },
  {
    id: 'demand-indicators',
    title: 'Demand indicators',
    decision: 'Surface observable demand signals (listing velocity, absorption) rather than an opinionated demand score.',
    evidence: 'Listing-portal or brokerage-reported inventory and absorption data with a stated collection date.',
    keywords: ['demand', 'listing velocity', 'absorption', 'inventory'],
  },
]

export const marketMetadataFields: MarketMetadataField[] = [
  { id: 'comparable-source', label: 'Comparable-transaction source', value: 'Not connected', status: 'UNKNOWN' },
  { id: 'guidance-value-source', label: 'Guidance-value notification', value: 'Not connected', status: 'UNKNOWN' },
  { id: 'trend-source', label: 'Price-trend series', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'demand-source', label: 'Demand-indicator feed', value: 'UNKNOWN', status: 'UNKNOWN' },
]

export const marketNonClaims = [
  'A fair-market or appraised value for the parcel',
  'A price forecast or projected return',
  'Investment advice of any kind',
  'A guaranteed buyer or seller at any price',
] as const
