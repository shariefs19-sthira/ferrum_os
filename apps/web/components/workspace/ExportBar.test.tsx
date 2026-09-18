import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ExportBar from './ExportBar'
import type { StudioPlan } from '../../lib/types'

const plan: StudioPlan = {
  schema: 'ferrum-plan-v1',
  plotWidthM: 20,
  plotDepthM: 30,
  setbackM: 3,
  buildingWidthM: 14,
  buildingDepthM: 24,
  floors: 2,
  floorHeightM: 3,
  rooms: [],
  openings: [],
  elevations: [],
  generatedBy: 'deterministic-layout-v1',
}

let clicked: { href: string; download: string }[] = []

beforeEach(() => {
  clicked = []
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn((blob: Blob) => `blob:${blob.type}`),
    revokeObjectURL: vi.fn(),
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ href: this.href, download: this.download })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('workspace ExportBar', () => {
  it('exports a real DXF file with the plot footprint', () => {
    render(<ExportBar plan={plan} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export DXF' }))
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('ferrum-plan.dxf')
    expect(clicked[0].href).toBe('blob:application/dxf')
    expect(screen.getByText(/DXF exported/)).toBeTruthy()
  })

  it('exports a real IFC4 file matching the plan\'s floor count, not a placeholder', () => {
    render(<ExportBar plan={plan} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export IFC' }))
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('ferrum-plan.ifc')
    expect(clicked[0].href).toBe('blob:model/ifc')
    expect(screen.getByText(/IFC4 exported with 2 storey/)).toBeTruthy()
  })

  it('routes a text command ("export ifc") to the same real export, mirroring the DXF command wiring', () => {
    render(<ExportBar plan={plan} />)
    fireEvent(window, new CustomEvent('ferrum:workspace-command', { detail: 'export ifc' }))
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('ferrum-plan.ifc')
  })
})
