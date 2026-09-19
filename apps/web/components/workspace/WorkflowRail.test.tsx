import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ShellCatalogPanel from '../designstudio/ShellCatalogPanel'
import { getBuildingShell } from '../../lib/designstudio/shellCatalog'
import RegistryControls from './RegistryControls'
import WorkflowRail, { WORKFLOW_RAIL_BOTTOM_VAR } from './WorkflowRail'

describe('WorkflowRail', () => {
  it('presents seven outcome stages and keeps secondary products behind disclosure', () => {
    render(<WorkflowRail activeProduct="Land" onProductChange={vi.fn()} />)
    const stages = screen.getAllByRole('list', { name: 'Project stages' })[0]
    expect(within(stages).getAllByRole('button')).toHaveLength(7)
    expect(screen.getAllByText('Quantities & cost').length).toBeGreaterThan(0)
    expect(screen.getAllByText('More workflows').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Community funding').length).toBeGreaterThan(0)
  })

  it('maps workflow selection onto the existing product callback', () => {
    const onProductChange = vi.fn()
    render(<WorkflowRail activeProduct="Land" onProductChange={onProductChange} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Engineering\. Issue/i })[0])
    expect(onProductChange).toHaveBeenCalledWith('Structure')
  })

  it('shows stale upstream data only when supplied by project state', () => {
    render(<WorkflowRail activeProduct="Cost" staleProducts={['Cost']} onProductChange={vi.fn()} />)
    expect(screen.getAllByLabelText('Evidence status: STALE UPSTREAM DATA').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Quantities & cost\. Stale/i }).length).toBeGreaterThan(0)
  })

  it('keeps the same lifecycle and specialist destinations in the mobile disclosure', () => {
    render(<WorkflowRail activeProduct="Land" onProductChange={vi.fn()} />)
    expect(screen.getByLabelText('2 ready, 0 stale, 5 issues')).toBeTruthy()
    for (const label of ['Site', 'Design', 'Engineering', 'Quantities & cost', 'Procurement', 'Delivery', 'Evidence & approvals']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    for (const label of ['Market signals', 'Investment analysis', 'Community funding']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
  })

  it('renders the workflow disclosure above the canvas and closes it with Escape', async () => {
    render(<WorkflowRail activeProduct="Land" onProductChange={vi.fn()} />)
    const summary = screen.getByLabelText('2 ready, 0 stale, 5 issues').closest('summary')
    expect(summary).toBeTruthy()
    fireEvent.click(summary as HTMLElement)
    fireEvent(summary?.parentElement as HTMLElement, new Event('toggle'))
    expect(screen.getByRole('button', { name: 'Close workflow menu' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Project workflow' }).className).toContain('z-[90]')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'Close workflow menu' })).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(summary))
  })
})

describe('WorkflowRail vs fixed mobile sheets (landscape close-control occlusion)', () => {
  it('publishes its measured bottom edge on <html> and removes it on unmount', () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ bottom: 108.2, top: 48, left: 0, right: 667, width: 667, height: 60.2, x: 0, y: 48, toJSON: () => ({}) } as DOMRect)
    try {
      const { unmount } = render(<WorkflowRail activeProduct="Design" onProductChange={vi.fn()} />)
      expect(document.documentElement.style.getPropertyValue(WORKFLOW_RAIL_BOTTOM_VAR)).toBe('109px')
      unmount()
      expect(document.documentElement.style.getPropertyValue(WORKFLOW_RAIL_BOTTOM_VAR)).toBe('')
    } finally {
      rect.mockRestore()
    }
  })

  it('caps every fixed mobile sheet at the space below the rail while the rail stays above the sheets', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) })
    const shellInputs = { jurisdictionId: null, soilBearingKpa: null, windSpeedMps: null, seismicClass: null, snowLoadKpa: null, floorCount: 3, grossFloorAreaSqm: 1248, buildingWidthM: 16, buildingDepthM: 26, storeyHeightM: 3, materials: [], deadLoadKpa: null, liveLoadKpa: null, userChanges: [] }
    const controls = { plotWidthM: 24, plotDepthM: 40, setbackM: 3, floors: 4 }
    const context = { maxFloors: 6, minSetbackM: 1.5, maxSetbackM: 10 }
    render(<>
      <ShellCatalogPanel parcel={null} selectedShell={getBuildingShell('india-neutral-adaptive')} projectInputs={shellInputs} onSelect={vi.fn()} mobileOpen />
      <RegistryControls product="designstudio" parameters={controls} context={context} onChange={vi.fn()} mobileOpen />
      <RegistryControls product="landintel" parameters={controls} context={context} onChange={vi.fn()} mobileOpen />
    </>)
    const sheets = Array.from(document.querySelectorAll<HTMLElement>('[data-mobile-sheet]'))
    expect(sheets).toHaveLength(3)
    for (const sheet of sheets) {
      expect(sheet.className).toContain(`var(${WORKFLOW_RAIL_BOTTOM_VAR},0px)`)
      expect(sheet.className).toContain('z-[80]')
    }
    render(<WorkflowRail activeProduct="Design" onProductChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Project workflow' }).className).toContain('z-[90]')
  })
})
