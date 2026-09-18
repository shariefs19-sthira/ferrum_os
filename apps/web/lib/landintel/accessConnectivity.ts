export type AccessEvidenceStatus = 'SOURCE-VERIFIED' | 'INDICATIVE' | 'INFERRED' | 'UNKNOWN' | 'STALE'

export type AccessCapability = {
  id: string
  title: string
  decision: string
  evidence: string
  keywords: string[]
}

export type AccessMetadataField = {
  id: string
  label: string
  value: string
  status: AccessEvidenceStatus
}

export const accessEvidenceStates: AccessEvidenceStatus[] = [
  'SOURCE-VERIFIED',
  'INDICATIVE',
  'INFERRED',
  'UNKNOWN',
  'STALE',
]

export const accessCapabilities: AccessCapability[] = [
  {
    id: 'legal-access',
    title: 'Legal / lawful access',
    decision: 'Confirm the parcel has a recorded right of way or frontage on a public road, not merely map-visible adjacency.',
    evidence: 'Recorded easement, right-of-way deed, or authority road-frontage record.',
    keywords: ['right of way', 'easement', 'frontage', 'legal access'],
  },
  {
    id: 'road-classification',
    title: 'Road classification & width',
    decision: 'Compare the fronting road class and carriageway width against the setback/FAR rules that depend on it.',
    evidence: 'Authority road-width register or a surveyed carriageway measurement.',
    keywords: ['road width', 'road classification', 'carriageway'],
  },
  {
    id: 'transit-proximity',
    title: 'Public-transit proximity',
    decision: 'Screen straight-line and network proximity to metro, rail and organized bus stops.',
    evidence: 'Official transit-stop registry with coordinates and a routed (not straight-line) distance/time source.',
    keywords: ['transit', 'metro', 'bus stop', 'rail', 'proximity'],
  },
  {
    id: 'utility-connectivity',
    title: 'Utility connectivity',
    decision: 'Establish whether power, water and sewer connections are available at the boundary versus requiring extension.',
    evidence: 'Utility-provider connection record or a site connectivity certificate.',
    keywords: ['power', 'water', 'sewer', 'utility connection'],
  },
  {
    id: 'connectivity-corridor',
    title: 'Arterial / corridor connectivity',
    decision: 'Assess drive-time reach to arterial roads, ring roads and planned corridors that affect long-run accessibility.',
    evidence: 'Routed drive-time analysis against a maintained road network, not a straight-line radius.',
    keywords: ['arterial', 'corridor', 'ring road', 'drive time'],
  },
]

export const accessMetadataFields: AccessMetadataField[] = [
  { id: 'frontage-source', label: 'Frontage / right-of-way record', value: 'Not connected', status: 'UNKNOWN' },
  { id: 'road-width-source', label: 'Road-width register', value: 'Not connected', status: 'UNKNOWN' },
  { id: 'transit-source', label: 'Transit-stop registry', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'utility-source', label: 'Utility connection record', value: 'UNKNOWN', status: 'UNKNOWN' },
  { id: 'routing-engine', label: 'Routed drive-time engine', value: 'Not connected', status: 'UNKNOWN' },
]

export const accessNonClaims = [
  'A guaranteed travel time to any destination',
  'Utility connection availability or capacity at the boundary',
  'Legal right of way where none is separately verified',
  'Future road-widening or corridor commitments',
] as const
