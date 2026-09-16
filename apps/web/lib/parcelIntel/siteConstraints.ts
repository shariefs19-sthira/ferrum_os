import type { ParcelContext } from '../workspace/parcelContext'

export type AuthorityEvidenceStatus = 'VERIFIED' | 'INDICATIVE' | 'GAP'

export type AuthoritySourceCandidate = {
  label: string
  officialUrl: string
  documentVersion: string | null
  effectiveDate: string | null
  clause: string | null
  applicability: string
  lastChecked: string
  status: AuthorityEvidenceStatus
}

export type SiteConstraintsEvidence = {
  locationLabel: string
  planningAuthority: string | null
  governingDocument: string | null
  documentVersion: string | null
  effectiveDate: string | null
  clause: string | null
  applicability: string
  lastChecked: string
  status: AuthorityEvidenceStatus
  sources: AuthoritySourceCandidate[]
}

const LAST_CHECKED = '2026-09-16'

const maharashtraCandidates: AuthoritySourceCandidate[] = [
  {
    label: 'Maharashtra Urban Development Department — UDCPR material',
    officialUrl: 'https://urban.maharashtra.gov.in/document/%E0%A4%8F%E0%A4%95%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A5%83%E0%A4%A4-%E0%A4%B5%E0%A4%BF%E0%A4%95%E0%A4%BE%E0%A4%B8-%E0%A4%A8%E0%A4%BF%E0%A4%AF%E0%A4%82%E0%A4%A4%E0%A5%8D%E0%A4%B0-3/',
    documentVersion: null,
    effectiveDate: null,
    clause: null,
    applicability: 'Candidate source only. Parcel jurisdiction, current amendment set and clause applicability are not verified.',
    lastChecked: LAST_CHECKED,
    status: 'GAP',
  },
  {
    label: 'Pune Municipal Corporation — AutoDCR portal',
    officialUrl: 'https://autodcr.pmc.gov.in/SWC.Client/Login.aspx',
    documentVersion: null,
    effectiveDate: null,
    clause: null,
    applicability: 'Candidate municipal portal only. The selected parcel may fall under a different planning authority.',
    lastChecked: LAST_CHECKED,
    status: 'GAP',
  },
]

/**
 * Evidence contract for authority-facing constraints. Candidate links are not
 * converted into regulatory values until authority, version, clause and parcel
 * applicability are all verified.
 */
export function getSiteConstraintsEvidence(parcel: ParcelContext | null): SiteConstraintsEvidence {
  const locationLabel = parcel ? `${parcel.district}, ${parcel.state}` : 'SAMPLE LOCATION · Bengaluru, Karnataka'
  const sources = parcel?.state === 'Maharashtra' ? maharashtraCandidates : []
  return {
    locationLabel,
    planningAuthority: null,
    governingDocument: null,
    documentVersion: null,
    effectiveDate: null,
    clause: null,
    applicability: parcel
      ? 'GAP — resolve the parcel boundary and competent planning authority before applying a rule.'
      : 'GAP — sample location only; no parcel jurisdiction has been established.',
    lastChecked: LAST_CHECKED,
    status: 'GAP',
    sources,
  }
}
