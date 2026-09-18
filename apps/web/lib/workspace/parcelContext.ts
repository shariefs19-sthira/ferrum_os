import { useEffect, useState } from 'react'
import type { AnalysisResult } from '../types/analysis'
import { ParcelAnalyzer } from '../analysis/parcelAnalyzer'

export const PARCEL_CONTEXT_KEY = 'ferrum-parcel-context-v1'
export const PARCEL_CONTEXT_EVENT = 'ferrum:parcel-context'

export type ParcelProvenance = {
  source: string
  vintage: string
  status: 'INDICATIVE' | 'VERIFIED' | 'GAP'
}

export type ParcelContext = {
  version: 1
  method: string
  ulpin: string | null
  state: string
  district: string
  area_sqm: number
  land_use: string
  coordinates: { lat: number; lng: number } | null
  provenance: ParcelProvenance
}

export function isParcelContext(value: unknown): value is ParcelContext {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ParcelContext>
  return item.version === 1 && typeof item.method === 'string' && typeof item.state === 'string' &&
    typeof item.district === 'string' && Number.isFinite(item.area_sqm) && Number(item.area_sqm) >= 0 &&
    typeof item.land_use === 'string' && !!item.provenance && typeof item.provenance.source === 'string'
}

export function readParcelContext(): ParcelContext | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PARCEL_CONTEXT_KEY) ?? 'null')
    return isParcelContext(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeParcelContext(context: ParcelContext): void {
  if (!isParcelContext(context)) throw new Error('Invalid parcel context')
  window.localStorage.setItem(PARCEL_CONTEXT_KEY, JSON.stringify(context))
  window.dispatchEvent(new CustomEvent<ParcelContext>(PARCEL_CONTEXT_EVENT, { detail: context }))
}

export function subscribeParcelContext(listener: (context: ParcelContext | null) => void): () => void {
  const local = (event: Event) => listener((event as CustomEvent<ParcelContext>).detail)
  const storage = (event: StorageEvent) => {
    if (event.key === PARCEL_CONTEXT_KEY) listener(readParcelContext())
  }
  window.addEventListener(PARCEL_CONTEXT_EVENT, local)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener(PARCEL_CONTEXT_EVENT, local)
    window.removeEventListener('storage', storage)
  }
}

export function useParcelContext(): ParcelContext | null {
  const [context, setContext] = useState<ParcelContext | null>(null)
  useEffect(() => {
    setContext(readParcelContext())
    return subscribeParcelContext(setContext)
  }, [])
  return context
}

const ANALYSIS_TTL_MS = 5 * 60 * 1000
const analysisCache = new Map<string, { expiresAt: number; result: AnalysisResult }>()
const analysisLoading = new Set<string>()

export const analysisId = (context: ParcelContext) => context.ulpin?.trim() || `${context.method}:${context.state}:${context.district}:${context.area_sqm}:${context.land_use}`

/** Returns whether analysis is currently loading for this parcel context. */
export function isParcelAnalysisLoading(context: ParcelContext): boolean {
  return analysisLoading.has(analysisId(context))
}

/**
 * Explicit deeper-analysis lifecycle a UI can render directly, rather than a
 * bare loading boolean. QUEUED covers the brief real window between a call
 * being made and its work actually starting (meaningful once more than one
 * analysis can be in flight); it is never held open artificially.
 */
export type ParcelAnalysisStatus = 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED'

const analysisStatus = new Map<string, ParcelAnalysisStatus>()
const statusListeners = new Set<() => void>()

const setAnalysisStatus = (id: string, status: ParcelAnalysisStatus | null) => {
  if (status === null) analysisStatus.delete(id)
  else analysisStatus.set(id, status)
  statusListeners.forEach((listener) => listener())
}

/** Returns the last known explicit lifecycle state for this parcel context, or undefined before any analysis has ever been requested. */
export function getParcelAnalysisStatus(context: ParcelContext): ParcelAnalysisStatus | undefined {
  return analysisStatus.get(analysisId(context))
}

/** Subscribes to any parcel-analysis status transition, across all parcel ids. */
export function subscribeParcelAnalysisStatus(listener: () => void): () => void {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

/**
 * Analyzes a parcel with a five-minute in-memory cache.
 * The optional loading callback receives balanced true/false transitions even
 * when analysis rejects. Cached reads do not enter a loading state.
 */
export async function analyzeParcel(context: ParcelContext, onLoadingChange?: (loading: boolean) => void): Promise<AnalysisResult> {
  if (!isParcelContext(context)) throw new Error('Invalid parcel context')
  const id = analysisId(context)
  const cached = analysisCache.get(id)
  if (cached && cached.expiresAt > Date.now()) return cached.result
  setAnalysisStatus(id, 'QUEUED')
  analysisLoading.add(id)
  onLoadingChange?.(true)
  try {
    setAnalysisStatus(id, 'RUNNING')
    const result = await new ParcelAnalyzer(id).analyze()
    analysisCache.set(id, { expiresAt: Date.now() + ANALYSIS_TTL_MS, result })
    setAnalysisStatus(id, 'COMPLETE')
    return result
  } catch (error) {
    setAnalysisStatus(id, 'FAILED')
    throw error
  } finally {
    analysisLoading.delete(id)
    onLoadingChange?.(false)
  }
}

/** Clears cached parcel analyses; exported for explicit refresh and tests. */
export function clearParcelAnalysisCache(): void {
  analysisCache.clear()
  analysisLoading.clear()
  analysisStatus.clear()
}

/**
 * True when `generatedFor` is not the currently active parcel context — i.e.
 * a downstream artifact (a saved report, a Project Context snapshot handed
 * to LandForecast/DesignStudio) was produced for a site the user has since
 * moved away from, and must be recomputed before it can be trusted again.
 * Returns true (stale) when there is no active context at all.
 */
export function isParcelAnalysisStale(generatedFor: ParcelContext): boolean {
  const active = readParcelContext()
  if (!active) return true
  return analysisId(active) !== analysisId(generatedFor)
}

/** Live-subscribes to a parcel context's explicit analysis lifecycle state for rendering (QUEUED/RUNNING/COMPLETE/FAILED, or undefined before any request). */
export function useParcelAnalysisStatus(context: ParcelContext | null): ParcelAnalysisStatus | undefined {
  const id = context ? analysisId(context) : null
  const [status, setStatus] = useState<ParcelAnalysisStatus | undefined>(() => (context ? getParcelAnalysisStatus(context) : undefined))
  useEffect(() => {
    if (!context) { setStatus(undefined); return }
    setStatus(getParcelAnalysisStatus(context))
    return subscribeParcelAnalysisStatus(() => setStatus(getParcelAnalysisStatus(context)))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps -- id is context's own stable identity
  return status
}
