import { useEffect, useState } from 'react'

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
    typeof item.district === 'string' && Number.isFinite(item.area_sqm) && Number(item.area_sqm) > 0 &&
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
