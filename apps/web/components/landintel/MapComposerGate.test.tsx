import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MapComposerGate from './MapComposerGate'
import type { ParcelContext } from '../../lib/workspace/parcelContext'

const parcelState: { current: ParcelContext | null } = { current: null }
vi.mock('../../lib/workspace/parcelContext', () => ({ useParcelContext: () => parcelState.current }))

const seededParcel: ParcelContext = {
  version: 1,
  method: 'ulpin',
  ulpin: 'KA-BLR-0001-2024',
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  area_sqm: 1500,
  land_use: 'Commercial',
  coordinates: { lat: 12.9716, lng: 77.5946 },
  provenance: { source: 'Ferrum seeded D1 ULPIN record — not an official registry result', vintage: '2026-09-10', status: 'INDICATIVE' },
}

const gapParcel: ParcelContext = {
  version: 1,
  method: 'coordinates',
  ulpin: null,
  state: 'GAP',
  district: 'GAP',
  area_sqm: 0,
  land_use: 'GAP',
  coordinates: { lat: 12.9, lng: 77.5 },
  provenance: { source: 'User-entered coordinates — address and parcel attributes are GAP', vintage: '2026-09-16', status: 'GAP' },
}

describe('LandIntel Map Composer export-readiness workflow', () => {
  beforeEach(() => {
    localStorage.clear()
    parcelState.current = null
  })

  it('shows all 11 checks and starts fully blocked with no project loaded', () => {
    render(<MapComposerGate />)
    expect(screen.getByLabelText('Map export status').textContent).toContain('BLOCKED · 0 / 11 checks passed')
    expect(screen.getAllByText('Blocked')).toHaveLength(11)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Export map/ }).disabled).toBe(true)
    for (const title of [
      'Purpose & analysis subject', 'Verified project boundary', 'Geometry-derived scale & units',
      'Correct north orientation', 'CRS / EPSG identification', 'Sources & observation dates',
      'Active-layer legend', 'Location inset when required', 'Collision-checked labels',
      'Confidence & UNKNOWN treatment', 'INDICATIVE qualification',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeTruthy()
    }
    expect(screen.getByText(/No project location or parcel is loaded/)).toBeTruthy()
    expect(screen.getByText(/Automated label collision, leader-line and contrast checking is not built yet/)).toBeTruthy()
  })

  it('rejects placeholder or too-short metadata and keeps those checks blocked', () => {
    render(<MapComposerGate />)
    fireEvent.change(screen.getByLabelText('Map title'), { target: { value: 'Map' } })
    fireEvent.change(screen.getByLabelText('Purpose & analysis subject'), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText('CRS / EPSG identifier'), { target: { value: 'not-a-crs' } })
    expect(document.querySelector('[data-map-composer-requirement="purpose-subject"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    expect(document.querySelector('[data-map-composer-requirement="crs-epsg"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
  })

  it('passes format-validated checks once valid metadata and a sourced, dated layer are entered', () => {
    render(<MapComposerGate />)
    fireEvent.change(screen.getByLabelText('Map title'), { target: { value: 'Whitefield pre-purchase suitability map' } })
    fireEvent.change(screen.getByLabelText('Purpose & analysis subject'), { target: { value: 'Evaluate parcel suitability before purchase decision' } })
    fireEvent.change(screen.getByLabelText('CRS / EPSG identifier'), { target: { value: 'EPSG:4326' } })
    fireEvent.change(screen.getByLabelText('Author / issuer'), { target: { value: 'Jordan Lee' } })
    fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('Revision'), { target: { value: 'Rev A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add layer' }))
    fireEvent.change(screen.getByLabelText('Layer name'), { target: { value: 'Survey overlay' } })
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'District survey office' } })
    fireEvent.change(screen.getByLabelText('Observation date'), { target: { value: '2026-08-01' } })

    expect(document.querySelector('[data-map-composer-requirement="purpose-subject"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
    expect(document.querySelector('[data-map-composer-requirement="crs-epsg"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
    expect(document.querySelector('[data-map-composer-requirement="source-dates"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
    expect(document.querySelector('[data-map-composer-requirement="active-layer-legend"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
    // Boundary evidence and label-collision checking still have no real evidence pipeline, so export stays blocked.
    expect(document.querySelector('[data-map-composer-requirement="project-boundary"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Export map/ }).disabled).toBe(true)
  })

  it('never unlocks export on seeded/INDICATIVE parcel data, even after acknowledgment', () => {
    parcelState.current = seededParcel
    render(<MapComposerGate />)
    expect(screen.getByText(/Loaded parcel context for Bengaluru Urban is INDICATIVE/)).toBeTruthy()
    const indicativeCheckbox = screen.getByLabelText<HTMLInputElement>(/I acknowledge this map will be watermarked INDICATIVE/)
    expect(indicativeCheckbox.disabled).toBe(false)
    expect(document.querySelector('[data-map-composer-requirement="indicative-status"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    fireEvent.click(indicativeCheckbox)
    expect(document.querySelector('[data-map-composer-requirement="indicative-status"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
    expect(document.querySelector('[data-map-composer-requirement="project-boundary"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    expect(document.querySelector('[data-map-composer-requirement="label-collisions"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Export map/ }).disabled).toBe(true)
  })

  it('requires a locator inset only when regional context is unresolved', () => {
    parcelState.current = gapParcel
    render(<MapComposerGate />)
    const locatorCheckbox = screen.getByLabelText<HTMLInputElement>(/Locator inset added/)
    expect(locatorCheckbox.disabled).toBe(false)
    expect(document.querySelector('[data-map-composer-requirement="locator-inset"]')?.getAttribute('data-map-composer-check-passed')).toBe('false')
    fireEvent.click(locatorCheckbox)
    expect(document.querySelector('[data-map-composer-requirement="locator-inset"]')?.getAttribute('data-map-composer-check-passed')).toBe('true')
  })

  it('disables the locator-inset and INDICATIVE checkboxes when they do not apply', () => {
    render(<MapComposerGate />)
    expect(screen.getByLabelText<HTMLInputElement>(/Locator inset added/).disabled).toBe(true)
    expect(screen.getByLabelText<HTMLInputElement>(/I acknowledge this map will be watermarked INDICATIVE/).disabled).toBe(true)
  })
})
