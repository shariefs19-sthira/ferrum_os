import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import CanvasSlot, { productControls } from './CanvasSlot'
import { resolveProductSurface } from '../../lib/workspace/productSurface'
import { workspaceProducts } from '../../lib/types'

vi.mock('./Space3D', () => ({ default: () => <div data-testid="space3d-stub" /> }))
vi.mock('../sections/UlpinMapExplorer', () => ({ default: () => <div>ULPIN lookup stub</div> }))

const tool = () => document.querySelector('[data-product-tool-surface]') as HTMLElement | null

describe('CanvasSlot product-aware cockpit', () => {
  beforeEach(() => window.localStorage.clear())

  it('keeps the building model and shell controls for Design, with no product tool panel', () => {
    render(<CanvasSlot product="Design" />)
    expect(tool()).toBeNull()
    expect(screen.getByRole('button', { name: 'Shells' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Controls' }))
    expect(document.querySelector('[data-control-id="design-height"]')).toBeTruthy()
    expect(document.querySelector('[data-cockpit-canvas]')).toBeTruthy()
  })

  it('switching Design -> Land -> Structure -> Cost -> Invest -> Transact changes the visible active tool', () => {
    const { rerender } = render(<CanvasSlot product="Design" />)
    const steps = [
      ['Land', 'ULPIN parcel lookup', 'ulpin-lookup'],
      ['Structure', 'IS 456 / IS 800 clause checks', 'is-check'],
      ['Cost', 'BOQ cost-split scenario', 'boq-cost-split'],
      ['Invest', 'IRR / NPV modeler', 'irr-npv'],
      ['Transact', 'Stamp duty & ask band', 'stamp-duty-ask-band'],
    ] as const
    for (const [product, title, key] of steps) {
      rerender(<CanvasSlot product={product} />)
      const panel = tool() as HTMLElement
      expect(panel.getAttribute('data-product-tool-surface')).toBe(productControls[product])
      expect(panel.getAttribute('data-tool-state')).toBe('LIVE')
      expect(within(panel).getByRole('heading', { name: title })).toBeTruthy()
      expect(panel.querySelector(`[data-live-tool="${key}"]`)).toBeTruthy()
      // The central preview stays mounted while a product tool is active.
      expect(document.querySelector('[data-cockpit-canvas]')).toBeTruthy()
    }
    rerender(<CanvasSlot product="Design" />)
    expect(tool()).toBeNull()
  })

  it("shows each live tool's own controls, never building proxy knobs", () => {
    const { rerender } = render(<CanvasSlot product="Structure" />)
    expect(screen.getByLabelText('Structure type')).toBeTruthy()
    rerender(<CanvasSlot product="Cost" />)
    expect(document.querySelector('[data-forecast-slider]')).toBeTruthy()
    rerender(<CanvasSlot product="Invest" />)
    expect(screen.getByText(/discount rate/i)).toBeTruthy()
    rerender(<CanvasSlot product="Transact" />)
    expect(screen.getAllByText('State').length).toBeGreaterThan(0)
    for (const product of ['Land', 'Structure', 'Cost', 'Market', 'Invest', 'Transact'] as const) {
      rerender(<CanvasSlot product={product} />)
      expect(document.querySelector('[data-control-id="design-height"]')).toBeNull()
      expect(screen.queryByText('How tall?')).toBeNull()
      expect(screen.queryByText('How many families?')).toBeNull()
      expect(screen.queryByText('How many supported levels?')).toBeNull()
    }
  })

  it.each(['Build', 'Procure', 'Community'] as const)('%s states ROADMAP truthfully and offers no action', (product) => {
    render(<CanvasSlot product={product} />)
    const panel = tool() as HTMLElement
    expect(panel.getAttribute('data-tool-state')).toBe('ROADMAP')
    expect(within(panel).getByRole('heading', { name: 'No live tool yet' })).toBeTruthy()
    const state = panel.querySelector('[data-roadmap-state]') as HTMLElement
    expect(state.textContent).toBe("ROADMAPNo live tool exists for this product yet. Nothing here is computed, and there is no action to run.")
    expect(state.textContent).not.toContain('apps/web')
    expect(panel.querySelector('[data-live-tool]')).toBeNull()
    expect(panel.querySelectorAll('input, select, textarea, a, button').length).toBe(0)
    expect(document.querySelector('[data-control-registry]')).toBeNull()
    expect(screen.getByRole('button', { name: `${product} · ROADMAP` })).toBeTruthy()
  })

  it('lists unbuilt capabilities of a live product as ROADMAP, never as actions', () => {
    render(<CanvasSlot product="Structure" />)
    const list = document.querySelector('[data-roadmap-list]') as HTMLElement
    expect(list.textContent).toContain('FEA analysis')
    expect(list.querySelectorAll('button, a, input').length).toBe(0)
    Array.from(list.querySelectorAll('[data-roadmap-feature]')).forEach((item) => expect(item.textContent).toContain('ROADMAP'))
  })

  it('offers a mobile tool trigger that opens a dismissible sheet, closed by default', () => {
    render(<CanvasSlot product="Cost" />)
    expect(document.querySelector('[data-mobile-sheet="tool"]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cost tool' }))
    const sheet = document.querySelector('[data-mobile-sheet="tool"]') as HTMLElement
    expect(within(sheet).getByRole('heading', { name: 'BOQ cost-split scenario' })).toBeTruthy()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    expect(document.querySelector('[data-mobile-sheet="tool"]')).toBeNull()
  })

  it('resolves every workspace product to a surface consistent with the product registries', () => {
    for (const product of workspaceProducts) {
      const surface = resolveProductSurface(productControls[product])
      if (surface.state === 'LIVE') {
        // Design's live surface is the building model itself, not a tool panel.
        if (product === 'Design') expect(surface.tool).toBeNull()
        else expect(surface.tool).not.toBeNull()
        expect(surface.available.length).toBeGreaterThan(0)
      } else {
        expect(surface.tool).toBeNull()
        expect(surface.roadmapReason).toBeTruthy()
        expect(surface.available.length).toBe(0)
      }
    }
    const roadmapProducts = [...workspaceProducts].filter((product) => resolveProductSurface(productControls[product]).state === 'ROADMAP')
    expect(roadmapProducts.sort()).toEqual(['Build', 'Community', 'Procure'])
  })
})
