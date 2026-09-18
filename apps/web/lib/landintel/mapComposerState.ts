export type MapComposerLayer = {
  id: string
  name: string
  source: string
  observationDate: string
  editable: boolean
}

export type MapComposerMetadata = {
  version: 1
  title: string
  purpose: string
  crs: string
  author: string
  issueDate: string
  revision: string
  locatorInsetAdded: boolean
  indicativeAcknowledged: boolean
  layers: MapComposerLayer[]
}

export const MAP_COMPOSER_STATE_KEY = 'ferrum-map-composer-metadata-v1'

export const emptyMapComposerMetadata: MapComposerMetadata = {
  version: 1,
  title: '',
  purpose: '',
  crs: '',
  author: '',
  issueDate: '',
  revision: '',
  locatorInsetAdded: false,
  indicativeAcknowledged: false,
  layers: [],
}

function isLayer(value: unknown): value is MapComposerLayer {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<MapComposerLayer>
  return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.source === 'string' &&
    typeof item.observationDate === 'string' && typeof item.editable === 'boolean'
}

export function isMapComposerMetadata(value: unknown): value is MapComposerMetadata {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<MapComposerMetadata>
  return item.version === 1 && typeof item.title === 'string' && typeof item.purpose === 'string' &&
    typeof item.crs === 'string' && typeof item.author === 'string' && typeof item.issueDate === 'string' &&
    typeof item.revision === 'string' && typeof item.locatorInsetAdded === 'boolean' &&
    typeof item.indicativeAcknowledged === 'boolean' && Array.isArray(item.layers) && item.layers.every(isLayer)
}

export function readMapComposerMetadata(): MapComposerMetadata {
  if (typeof window === 'undefined') return emptyMapComposerMetadata
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MAP_COMPOSER_STATE_KEY) ?? 'null')
    return isMapComposerMetadata(parsed) ? parsed : emptyMapComposerMetadata
  } catch {
    return emptyMapComposerMetadata
  }
}

export function writeMapComposerMetadata(metadata: MapComposerMetadata): void {
  if (!isMapComposerMetadata(metadata)) throw new Error('Invalid Map Composer metadata')
  window.localStorage.setItem(MAP_COMPOSER_STATE_KEY, JSON.stringify(metadata))
}

export function generateLayerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
