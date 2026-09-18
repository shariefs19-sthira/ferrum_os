import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBuildingShell } from '../../lib/designstudio/shellCatalog'
import type { ProjectTemplateInputs } from '../../lib/designstudio/buildingLibraryKernel'
import ShellCatalogPanel from './ShellCatalogPanel'

const baseInputs: ProjectTemplateInputs = {
  jurisdictionId: null,
  soilBearingKpa: null,
  windSpeedMps: null,
  seismicClass: null,
  snowLoadKpa: null,
  floorCount: 3,
  grossFloorAreaSqm: 1248,
  buildingWidthM: 16,
  buildingDepthM: 26,
  storeyHeightM: 3,
  materials: [],
  deadLoadKpa: null,
  liveLoadKpa: null,
  userChanges: [],
}

describe('ShellCatalogPanel governed template evidence', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    })
  })

  it('shows selected template identity and truthful downstream states without opening expert details', () => {
    render(<ShellCatalogPanel parcel={null} selectedShell={getBuildingShell('india-neutral-adaptive')} projectInputs={baseInputs} onSelect={vi.fn()} />)
    const identity = document.querySelector('[data-template-identity]')!
    expect(identity.textContent).toContain('ferrum:india-neutral-adaptive')
    expect(identity.textContent).toContain('v0.1.0')
    expect(identity.textContent).toContain('CATALOGUE REVIEWED')
    expect(identity.textContent).toContain('NOT COMPUTED')
    expect(identity.textContent).toContain('NOT MEASURED')
    expect(identity.querySelector('[aria-label^="Template checksum sha256:"]')).toBeTruthy()
    expect(screen.getByText(/Target 15–30 min to first coordinated option/)).toBeTruthy()
    expect(document.querySelector('[data-template-evidence]')?.hasAttribute('open')).toBe(false)
    expect(document.querySelector('[data-recomputation-evidence]')?.hasAttribute('open')).toBe(false)
  })

  it('preserves provenance, licence, applicability and parameter limits behind progressive disclosure', () => {
    render(<ShellCatalogPanel parcel={null} selectedShell={getBuildingShell('kerala-courtyard')} projectInputs={baseInputs} onSelect={vi.fn()} />)
    const evidence = document.querySelector('[data-template-evidence]')!
    fireEvent.click(screen.getByText('Evidence and reuse limits'))
    expect(evidence.hasAttribute('open')).toBe(true)
    expect(evidence.textContent).toContain('FERRUM-INTERNAL-TEMPLATE-1.0')
    expect(evidence.textContent).toContain('no architect project geometry')
    expect(evidence.textContent).toContain('warm-humid')
    expect(evidence.textContent).toContain('220–4000 m²')
  })

  it('surfaces missing site evidence and user-change invalidation', () => {
    render(<ShellCatalogPanel parcel={null} selectedShell={getBuildingShell('india-neutral-adaptive')} projectInputs={{ ...baseInputs, userChanges: ['GEOMETRY'] }} onSelect={vi.fn()} />)
    const recomputation = document.querySelector('[data-recomputation-evidence]')!
    fireEvent.click(screen.getByText('Site inputs and recomputation'))
    expect(recomputation.hasAttribute('open')).toBe(true)
    expect(recomputation.textContent).toContain('NOT PRECOMPUTED')
    expect(recomputation.textContent).toContain('jurisdictionUNKNOWN')
    expect(recomputation.textContent).toContain('dimensionsRECORDED')
    expect(document.querySelector('[data-recompute-triggers]')?.textContent).toContain('USER CHANGE')
  })

  it('discloses active and planned engines without presenting planned adapters as connected', () => {
    render(<ShellCatalogPanel parcel={null} selectedShell={getBuildingShell('india-neutral-adaptive')} projectInputs={baseInputs} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Open engine disclosure'))
    const disclosure = document.querySelector('[data-open-engine-disclosure]')!
    expect(disclosure.textContent).toContain('2 ACTIVE')
    expect(disclosure.textContent).toContain('Three.js')
    expect(disclosure.textContent).toContain('ACTIVE DEPENDENCY')
    expect(disclosure.textContent).toContain('IfcOpenShell / Ifc5D')
    expect(disclosure.textContent).toContain('ARCHITECTURE PLANNED')
    expect(disclosure.textContent).toContain('Planned and evaluation entries are not connected software')
  })
})
