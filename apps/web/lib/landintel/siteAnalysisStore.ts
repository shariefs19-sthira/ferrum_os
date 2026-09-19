import { useEffect, useMemo, useState } from 'react'
import { analysisId, useParcelContext, type ParcelContext } from '../workspace/parcelContext'
import { synthesize, type ClassifiedObservation, type GateId, type SiteObservation, type SiteModuleId } from './siteAnalysis'

export const SITE_ANALYSIS_KEY = 'ferrum-site-analysis-v1'
export const SITE_ANALYSIS_EVENT = 'ferrum:site-analysis'

export type SiteReview = { snapshotHash: string; reviewedAt: string; reviewer: string }

export type HandoffRecord = {
  id: string
  module: SiteModuleId
  topic: string
  topicLabel: string
  basis: SiteObservation['basis']
  confidence: SiteObservation['confidence']
  observedOn: string
  observer: string
  sourceRef: string
  location: SiteObservation['location']
  locationSource: SiteObservation['locationSource']
  bearingDeg: number | null
  note: string
}

/**
 * The only context LandIntel hands to DesignStudio/SUTRA. It carries
 * qualified records and an explicit list of what is missing and which
 * professional gates remain OPEN; it never carries a recommendation, a
 * boundary, or a legal/geotechnical conclusion.
 */
export type SiteHandoff = {
  version: 1
  parcelKey: string
  parcelLabel: string
  snapshotHash: string
  reviewedAt: string
  reviewer: string
  sentAt: string
  anchor: { lat: number; lng: number } | null
  anchorNote: string
  qualified: HandoffRecord[]
  heldBackCount: number
  missing: { topicId: string; label: string; reason: string }[]
  gates: { id: GateId; label: string; status: 'OPEN' }[]
  boundary: 'UNKNOWN'
  designRecommendation: 'NOT_PRODUCED'
}

type ParcelBucket = { observations: SiteObservation[]; review: SiteReview | null }
export type SiteAnalysisStore = { version: 1; byParcel: Record<string, ParcelBucket>; handoff: SiteHandoff | null }

export const emptyStore = (): SiteAnalysisStore => ({ version: 1, byParcel: {}, handoff: null })

function isStore(value: unknown): value is SiteAnalysisStore {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<SiteAnalysisStore>
  return item.version === 1 && !!item.byParcel && typeof item.byParcel === 'object' && (item.handoff === null || typeof item.handoff === 'object')
}

export function readStore(): SiteAnalysisStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SITE_ANALYSIS_KEY) ?? 'null')
    return isStore(parsed) ? parsed : emptyStore()
  } catch {
    return emptyStore()
  }
}

/** Returns false when the browser refuses storage (private mode, quota); callers surface that instead of pretending the record was saved. */
export function writeStore(store: SiteAnalysisStore): boolean {
  try {
    window.localStorage.setItem(SITE_ANALYSIS_KEY, JSON.stringify(store))
  } catch {
    return false
  }
  window.dispatchEvent(new CustomEvent(SITE_ANALYSIS_EVENT))
  return true
}

const bucketOf = (store: SiteAnalysisStore, parcelKey: string): ParcelBucket => store.byParcel[parcelKey] ?? { observations: [], review: null }

export const observationsFor = (store: SiteAnalysisStore, parcelKey: string | null): SiteObservation[] => (parcelKey ? bucketOf(store, parcelKey).observations : [])
export const reviewFor = (store: SiteAnalysisStore, parcelKey: string | null): SiteReview | null => (parcelKey ? bucketOf(store, parcelKey).review : null)

/** Any change to the evidence drops the review: a reviewer signs off on a specific snapshot only. */
export function withObservations(store: SiteAnalysisStore, parcelKey: string, observations: SiteObservation[]): SiteAnalysisStore {
  return { ...store, byParcel: { ...store.byParcel, [parcelKey]: { observations, review: null } } }
}

export function withReview(store: SiteAnalysisStore, parcelKey: string, review: SiteReview | null): SiteAnalysisStore {
  return { ...store, byParcel: { ...store.byParcel, [parcelKey]: { ...bucketOf(store, parcelKey), review } } }
}

export function withHandoff(store: SiteAnalysisStore, handoff: SiteHandoff | null): SiteAnalysisStore {
  return { ...store, handoff }
}

export function subscribeStore(listener: (store: SiteAnalysisStore) => void): () => void {
  const local = () => listener(readStore())
  const storage = (event: StorageEvent) => {
    if (event.key === SITE_ANALYSIS_KEY) listener(readStore())
  }
  window.addEventListener(SITE_ANALYSIS_EVENT, local)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener(SITE_ANALYSIS_EVENT, local)
    window.removeEventListener('storage', storage)
  }
}

export function useSiteAnalysisStore(): SiteAnalysisStore {
  const [store, setStore] = useState<SiteAnalysisStore>(emptyStore)
  useEffect(() => {
    setStore(readStore())
    return subscribeStore(setStore)
  }, [])
  return store
}

export const todayIso = (clock: () => Date = () => new Date()): string => clock().toISOString().slice(0, 10)

export const parcelKeyOf = (parcel: ParcelContext | null): string | null => (parcel ? analysisId(parcel) : null)

export function parcelLabelOf(parcel: ParcelContext): string {
  return `${parcel.district}, ${parcel.state}${parcel.ulpin ? ` · ${parcel.ulpin}` : ''}`
}

export function buildHandoff(args: {
  parcel: ParcelContext
  review: SiteReview
  qualified: ClassifiedObservation[]
  heldBackCount: number
  missing: { topicId: string; label: string; reason: string }[]
  gates: { id: GateId; label: string }[]
  sentAt: string
  topicLabel: (topicId: string) => string
}): SiteHandoff {
  const { parcel, review } = args
  return {
    version: 1,
    parcelKey: analysisId(parcel),
    parcelLabel: parcelLabelOf(parcel),
    snapshotHash: review.snapshotHash,
    reviewedAt: review.reviewedAt,
    reviewer: review.reviewer,
    sentAt: args.sentAt,
    anchor: parcel.coordinates ? { lat: parcel.coordinates.lat, lng: parcel.coordinates.lng } : null,
    anchorNote: `Map point from ${parcel.provenance.source} (${parcel.provenance.status}, ${parcel.provenance.vintage}); context only, not a surveyed boundary.`,
    qualified: args.qualified.map(({ record, confidence }) => ({
      id: record.id, module: record.module, topic: record.topic, topicLabel: args.topicLabel(record.topic), basis: record.basis, confidence,
      observedOn: record.observedOn, observer: record.observer, sourceRef: record.sourceRef, location: record.location,
      locationSource: record.locationSource, bearingDeg: record.bearingDeg, note: record.note,
    })),
    heldBackCount: args.heldBackCount,
    missing: args.missing,
    gates: args.gates.map((gate) => ({ ...gate, status: 'OPEN' as const })),
    boundary: 'UNKNOWN',
    designRecommendation: 'NOT_PRODUCED',
  }
}

export type HandoffStatus =
  | { state: 'NONE' }
  | { state: 'CURRENT' }
  | { state: 'STALE'; reason: string }

/** A handoff is CURRENT only while the same parcel and the exact reviewed evidence snapshot are still active. */
export function handoffStatus(handoff: SiteHandoff | null, parcelKey: string | null, currentSnapshotHash: string): HandoffStatus {
  if (!handoff) return { state: 'NONE' }
  if (!parcelKey || parcelKey !== handoff.parcelKey) return { state: 'STALE', reason: 'The active site changed after this context was sent.' }
  if (currentSnapshotHash !== handoff.snapshotHash) return { state: 'STALE', reason: 'Site-analysis evidence changed after this context was reviewed and sent.' }
  return { state: 'CURRENT' }
}

/** Live view for read-only consumers (DesignStudio, SUTRA): the stored handoff plus whether it is still current. */
export function useSiteHandoff(clock?: () => Date): { handoff: SiteHandoff | null; status: HandoffStatus } {
  const store = useSiteAnalysisStore()
  const parcel = useParcelContext()
  const key = parcelKeyOf(parcel)
  const nowIso = todayIso(clock)
  const hash = synthesize(key, observationsFor(store, key), nowIso, !!parcel?.coordinates).snapshotHash
  // Memoized so consumers can list `status` in effect/callback dependencies without re-running them every render.
  const status = useMemo(() => handoffStatus(store.handoff, key, hash), [store.handoff, key, hash])
  return { handoff: store.handoff, status }
}
