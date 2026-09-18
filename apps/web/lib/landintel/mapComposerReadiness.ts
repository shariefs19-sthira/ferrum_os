import type { ParcelContext } from '../workspace/parcelContext'
import { mapComposerRequirements } from './mapComposerRequirements'
import type { MapComposerLayer, MapComposerMetadata } from './mapComposerState'

export type MapComposerCheck = {
  id: string
  title: string
  passed: boolean
  reason: string
}

const EPSG_PATTERN = /^EPSG:\d{4,6}$/i
const MIN_TITLE_LENGTH = 8
const MIN_PURPOSE_LENGTH = 12
const GENERIC_TITLES = new Set(['map', 'untitled', 'untitled map', 'my map', 'new map', 'test', 'test map'])
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000

export function isValidNonFutureDate(value: string): boolean {
  if (!value.trim()) return false
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return false
  return date.valueOf() <= Date.now() + FUTURE_TOLERANCE_MS
}

/** Combines the read-only layer derived from the live parcel context with the user's manually added layers. */
export function buildActiveLayers(metadata: MapComposerMetadata, parcel: ParcelContext | null): MapComposerLayer[] {
  const derived: MapComposerLayer[] = parcel
    ? [{
        id: 'parcel-context',
        name: parcel.district !== 'GAP' ? `Parcel / project context — ${parcel.district}` : 'Parcel / project context',
        source: parcel.provenance.source,
        observationDate: parcel.provenance.vintage,
        editable: false,
      }]
    : []
  return [...derived, ...metadata.layers]
}

function isLayerValid(layer: MapComposerLayer): boolean {
  return layer.name.trim().length > 0 && layer.source.trim().length > 0 && isValidNonFutureDate(layer.observationDate)
}

export function evaluateMapComposerReadiness(metadata: MapComposerMetadata, parcel: ParcelContext | null): MapComposerCheck[] {
  const hasParcel = !!parcel
  const parcelVerified = hasParcel && parcel!.provenance.status === 'VERIFIED'
  const geometryDerived = hasParcel && parcel!.area_sqm > 0
  const hasRegionalContext = hasParcel && parcel!.state !== 'GAP' && parcel!.district !== 'GAP'
  const crs = metadata.crs.trim()
  const crsValid = EPSG_PATTERN.test(crs)
  const title = metadata.title.trim()
  const titleValid = title.length >= MIN_TITLE_LENGTH && !GENERIC_TITLES.has(title.toLowerCase())
  const purposeValid = metadata.purpose.trim().length >= MIN_PURPOSE_LENGTH
  const authorValid = metadata.author.trim().length >= 2
  const issueDateValid = isValidNonFutureDate(metadata.issueDate)
  const revisionValid = metadata.revision.trim().length > 0
  const layers = buildActiveLayers(metadata, parcel)
  const layersValid = layers.length > 0 && layers.every(isLayerValid)

  const results: Record<string, MapComposerCheck> = {}

  results['purpose-subject'] = {
    id: 'purpose-subject',
    title: 'Purpose & analysis subject',
    passed: titleValid && purposeValid,
    reason: !titleValid
      ? 'Enter a specific map title of at least 8 characters that is not a generic placeholder.'
      : !purposeValid
        ? 'Describe the analysis purpose and subject in at least 12 characters.'
        : 'Map title and analysis purpose are both specific and recorded.',
  }

  results['project-boundary'] = {
    id: 'project-boundary',
    title: 'Verified project boundary',
    passed: parcelVerified,
    reason: !hasParcel
      ? 'No project location or parcel is loaded. Resolve a ULPIN, pin, coordinate or address above first.'
      : parcelVerified
        ? `Verified boundary evidence loaded for ${parcel!.district}.`
        : `Loaded parcel context for ${parcel!.district} is ${parcel!.provenance.status}, not authority-verified. A verified boundary is required before export.`,
  }

  results['scale-units'] = {
    id: 'scale-units',
    title: 'Geometry-derived scale & units',
    passed: geometryDerived,
    reason: geometryDerived
      ? `Scale can be derived from the loaded ${parcel!.area_sqm.toLocaleString('en-IN')} m² geometry.`
      : 'No geometry-derived area is available. Load a parcel with a real measured area to compute a scale.',
  }

  results['north-orientation'] = {
    id: 'north-orientation',
    title: 'Correct north orientation',
    passed: hasParcel && crsValid,
    reason: !hasParcel
      ? 'North cannot be derived without a loaded location and reference system.'
      : !crsValid
        ? 'North orientation depends on a valid CRS/EPSG identifier; set one below.'
        : 'North is derived from the loaded coordinates and the stated CRS.',
  }

  results['crs-epsg'] = {
    id: 'crs-epsg',
    title: 'CRS / EPSG identification',
    passed: crsValid,
    reason: crsValid ? `CRS recorded as ${crs.toUpperCase()}.` : 'Enter a valid CRS/EPSG identifier, for example EPSG:4326.',
  }

  results['source-dates'] = {
    id: 'source-dates',
    title: 'Sources & observation dates',
    passed: layersValid && authorValid && issueDateValid && revisionValid,
    reason: !layersValid
      ? 'Every active layer needs a non-empty source and a valid observation date that is not in the future.'
      : !authorValid
        ? 'Enter the map author or issuer.'
        : !issueDateValid
          ? 'Enter a valid issue date that is not in the future.'
          : !revisionValid
            ? 'Enter a revision identifier.'
            : 'Every active layer, the author, issue date and revision are recorded with valid dates.',
  }

  results['active-layer-legend'] = {
    id: 'active-layer-legend',
    title: 'Active-layer legend',
    passed: layers.length > 0 && layers.every((layer) => layer.name.trim().length > 0),
    reason: layers.length > 0
      ? 'Legend generated from the active layers listed below; it cannot drift from what is actually shown.'
      : 'Add at least one active layer before a legend can be generated.',
  }

  const locatorRequired = hasParcel && !hasRegionalContext
  results['locator-inset'] = {
    id: 'locator-inset',
    title: 'Location inset when required',
    passed: hasParcel && (!locatorRequired || metadata.locatorInsetAdded),
    reason: !hasParcel
      ? 'No location is loaded to assess whether a locator inset is required.'
      : !locatorRequired
        ? 'Not required: the loaded state and district already establish regional context.'
        : metadata.locatorInsetAdded
          ? 'Locator inset confirmed added for a location without resolved regional context.'
          : 'Regional context is not established (state/district unresolved); add a locator inset.',
  }

  results['label-collisions'] = {
    id: 'label-collisions',
    title: 'Collision-checked labels',
    passed: false,
    reason: 'Automated label collision, leader-line and contrast checking is not built yet; this check cannot pass.',
  }

  results['confidence-unknown'] = {
    id: 'confidence-unknown',
    title: 'Confidence & UNKNOWN treatment',
    passed: hasParcel,
    reason: hasParcel
      ? `Confidence is shown explicitly (${parcel!.provenance.status}) rather than implied.`
      : 'No context is loaded, so confidence and gaps cannot be disclosed yet.',
  }

  results['indicative-status'] = {
    id: 'indicative-status',
    title: 'INDICATIVE qualification',
    passed: hasParcel && (parcel!.provenance.status !== 'INDICATIVE' || metadata.indicativeAcknowledged),
    reason: !hasParcel
      ? 'No data is loaded that needs qualification.'
      : parcel!.provenance.status === 'INDICATIVE' && !metadata.indicativeAcknowledged
        ? 'Loaded data is INDICATIVE/seeded. Acknowledge the INDICATIVE watermark before this check can pass.'
        : 'INDICATIVE qualification is acknowledged and will be applied to the export.',
  }

  return mapComposerRequirements.map((item) => results[item.id])
}

export function summarizeReadiness(checks: MapComposerCheck[]): { passed: number; total: number; blocked: boolean } {
  const passed = checks.filter((check) => check.passed).length
  return { passed, total: checks.length, blocked: passed < checks.length }
}
