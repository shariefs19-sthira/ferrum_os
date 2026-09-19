import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateStudioPlan } from '../../lib/plan-gen'
import PlanElevationView from './PlanElevationView'
import WallInspector from './WallInspector'
import WorkspaceCockpit from './WorkspaceCockpit'

vi.mock('./Space3D', () => ({ default: ({ plan }: { plan: { walls?: unknown[] } }) => <div data-testid="space3d-stub" data-wall-count={plan.walls?.length} /> }))

// jsdom has no PointerEvent; a MouseEvent subclass carries clientX/clientY like the real one.
if (typeof window.PointerEvent === 'undefined') {
  class PolyfillPointerEvent extends MouseEvent {
    pointerId: number
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 1 }
  }
  Object.defineProperty(window, 'PointerEvent', { value: PolyfillPointerEvent, configurable: true })
}

const base = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 }

describe('PlanElevationView walls', () => {
  it('draws every wall of the active floor to scale with a 44 px non-scaling touch target on movable partitions', () => {
    const plan = generateStudioPlan(base)
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} />)
    expect(container.querySelectorAll('[data-wall-id]')).toHaveLength(8)
    const movable = container.querySelectorAll('[data-wall-hit-target="movable"]')
    expect(movable).toHaveLength(4)
    for (const target of Array.from(movable)) {
      expect(target.getAttribute('stroke-width')).toBe('44')
      expect(target.getAttribute('vector-effect')).toBe('non-scaling-stroke')
      expect((target as SVGElement).style.touchAction).toBe('none')
    }
    const wall = plan.walls!.find((candidate) => candidate.id === 'f1-int-v0')!
    const rect = container.querySelector('[data-wall-select="f1-int-v0"]')!
    expect(Number(rect.getAttribute('width'))).toBeCloseTo(wall.thicknessM, 6)
  })

  it('selects a wall by pointer and keyboard, and nudges a selected partition with arrow keys (Shift = coarse)', () => {
    const plan = generateStudioPlan(base)
    const onSelectWall = vi.fn()
    const onWallNudge = vi.fn()
    render(<PlanElevationView plan={plan} view="plan" activeFloor={1} selectedWallId="f1-int-v0" onSelectWall={onSelectWall} onWallNudge={onWallNudge} />)
    const wall = screen.getByRole('button', { name: /interior wall.*at 9\.92 metres/i })
    fireEvent.click(wall)
    fireEvent.keyDown(wall, { key: 'Enter' })
    expect(onSelectWall).toHaveBeenCalledTimes(2)
    fireEvent.keyDown(wall, { key: 'ArrowRight' })
    fireEvent.keyDown(wall, { key: 'ArrowLeft', shiftKey: true })
    fireEvent.keyDown(wall, { key: 'ArrowDown' })
    expect(onWallNudge).toHaveBeenNthCalledWith(1, 'f1-int-v0', 0.05)
    expect(onWallNudge).toHaveBeenNthCalledWith(2, 'f1-int-v0', -0.25)
    expect(onWallNudge).toHaveBeenCalledTimes(2)
  })

  it('does not move exterior walls: no drag target, no nudge', () => {
    const plan = generateStudioPlan(base)
    const onWallNudge = vi.fn()
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} selectedWallId="f1-ext-north" onWallNudge={onWallNudge} />)
    fireEvent.keyDown(container.querySelector('[data-wall-select="f1-ext-north"]')!, { key: 'ArrowDown' })
    expect(onWallNudge).not.toHaveBeenCalled()
    expect(container.querySelectorAll('[data-wall-hit-target="fixed"]')).toHaveLength(4)
  })

  it('drag emits live positions in building metres and commits once on release; a tap only selects', () => {
    const plan = generateStudioPlan(base)
    const onSelectWall = vi.fn()
    const onWallDrag = vi.fn()
    const onWallDragEnd = vi.fn()
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} selectedWallId="f1-int-v0" onSelectWall={onSelectWall} onWallDrag={onWallDrag} onWallDragEnd={onWallDragEnd} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    // jsdom has no SVG geometry: identity screen matrix, so client px == plot metres.
    Object.assign(svg, { getScreenCTM: () => ({ inverse: () => ({}) }), createSVGPoint: () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y } } }) })
    const target = container.querySelector('[data-wall-id="f1-int-v0"] [data-wall-hit-target]') as SVGLineElement
    fireEvent.pointerDown(target, { pointerId: 1, clientX: 12, clientY: 8 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 12, clientY: 8 })
    expect(onWallDrag).not.toHaveBeenCalled()
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 16.4, clientY: 8 })
    expect(onWallDrag).toHaveBeenLastCalledWith('f1-int-v0', 16.4 - plan.setbackM)
    fireEvent.pointerUp(target, { pointerId: 1 })
    expect(onWallDragEnd).toHaveBeenCalledWith('f1-int-v0', 16.4 - plan.setbackM)

    onWallDragEnd.mockClear()
    fireEvent.pointerDown(target, { pointerId: 2, clientX: 12, clientY: 8 })
    fireEvent.pointerUp(target, { pointerId: 2 })
    expect(onWallDragEnd).not.toHaveBeenCalled()
    expect(onSelectWall).toHaveBeenCalledWith('f1-int-v0')
  })

  it('a cancelled drag reports NaN so the caller can discard the preview', () => {
    const plan = generateStudioPlan(base)
    const onWallDragEnd = vi.fn()
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} onWallDrag={vi.fn()} onWallDragEnd={onWallDragEnd} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    Object.assign(svg, { getScreenCTM: () => ({ inverse: () => ({}) }), createSVGPoint: () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y } } }) })
    const target = container.querySelector('[data-wall-id="f1-int-v0"] [data-wall-hit-target]') as SVGLineElement
    fireEvent.pointerDown(target, { pointerId: 3, clientX: 14, clientY: 8 })
    fireEvent.pointerMove(target, { pointerId: 3, clientX: 18, clientY: 8 })
    fireEvent.pointerCancel(target, { pointerId: 3 })
    expect(Number.isNaN(onWallDragEnd.mock.calls[0][1])).toBe(true)
  })

  it('renders a legacy plan without plan.walls (walls derived from rooms)', () => {
    const { walls: _walls, ...legacy } = generateStudioPlan(base)
    const { container } = render(<PlanElevationView plan={legacy} view="plan" activeFloor={1} />)
    expect(container.querySelectorAll('[data-wall-id]')).toHaveLength(8)
  })
})

describe('WallInspector', () => {
  const plan = generateStudioPlan(base)
  const interior = plan.walls!.find((wall) => wall.id === 'f1-int-v0')!
  const exterior = plan.walls!.find((wall) => wall.id === 'f1-ext-north')!

  it('shows measured length/thickness/height and labels defaults as assumptions, INDICATIVE', () => {
    render(<WallInspector wall={interior} positionM={9.92} floors={2} openingCount={1} moved={false} onMoveTo={vi.fn()} onReset={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('115 mm')).toBeTruthy()
    expect(screen.getByText(/assumed defaults, not surveyed or structurally designed/i)).toBeTruthy()
    expect(screen.getByText(/INDICATIVE/)).toBeTruthy()
    expect(screen.getByText(/on all 2 floors/i)).toBeTruthy()
  })

  it('offers touch-sized nudge buttons and applies the numeric field on blur', () => {
    const onMoveTo = vi.fn(() => ({ positionM: 10.02 }))
    render(<WallInspector wall={interior} positionM={9.92} floors={2} openingCount={0} moved={false} onMoveTo={onMoveTo} onReset={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /move wall forward/i }))
    expect(onMoveTo).toHaveBeenLastCalledWith(expect.closeTo(10.02, 6))
    fireEvent.click(screen.getByRole('button', { name: /move wall back/i }))
    expect(onMoveTo).toHaveBeenLastCalledWith(expect.closeTo(9.82, 6))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.blur(input)
    expect(onMoveTo).toHaveBeenLastCalledWith(10)
    for (const button of screen.getAllByRole('button')) expect(button.className).toMatch(/min-h-11/)
  })

  it('surfaces a clamp message and enables reset only after a move', () => {
    const onMoveTo = vi.fn(() => ({ positionM: 1.5, message: 'Clamped: every room keeps at least 1.5 m.' }))
    const { rerender } = render(<WallInspector wall={interior} positionM={9.92} floors={1} openingCount={0} moved={false} onMoveTo={onMoveTo} onReset={vi.fn()} onClose={vi.fn()} />)
    expect((screen.getByRole('button', { name: /reset wall/i }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /move wall back/i }))
    expect(screen.getByRole('alert').textContent).toMatch(/clamped/i)
    rerender(<WallInspector wall={interior} positionM={1.5} floors={1} openingCount={0} moved onMoveTo={onMoveTo} onReset={vi.fn()} onClose={vi.fn()} />)
    expect((screen.getByRole('button', { name: /reset wall/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('exterior walls are read-only with an explanation', () => {
    render(<WallInspector wall={exterior} positionM={0} floors={1} openingCount={2} moved={false} onMoveTo={vi.fn()} onReset={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByText(/follow the plot and setback parameters/i)).toBeTruthy()
    expect(screen.getByText('230 mm')).toBeTruthy()
  })
})

describe('Cockpit plan-edit slice', () => {
  beforeEach(() => window.localStorage.clear())

  const openPlan = async () => {
    const view = render(<WorkspaceCockpit canvasFirst activeProduct="Design" controlProduct="designstudio" />)
    fireEvent.click(await screen.findByRole('tab', { name: 'Plan' }))
    return view
  }
  const roomWidth = (container: HTMLElement) => Number(container.querySelector('svg rect[fill="#DCE8EF"]')!.getAttribute('width'))
  const revision = (container: HTMLElement) => container.querySelector('[data-geometry-revision]')!.textContent

  it('offers the 2D plan inside the Design workspace and edits a wall end to end: select, move, stale, undo, redo', async () => {
    const { container } = await openPlan()
    await waitFor(() => expect(container.querySelector('[data-downstream-status="BOQ"]')).toBeTruthy())
    expect(container.querySelector('[data-downstream-status="BOQ"]')!.getAttribute('data-downstream-state')).toBe('CURRENT')

    const startRevision = revision(container)
    const startWidth = roomWidth(container)
    fireEvent.click(container.querySelector('[data-wall-select="f1-int-v0"]')!)
    const inspector = await screen.findByLabelText(/interior wall property inspector/i)
    fireEvent.click(within(inspector).getByRole('button', { name: /move wall forward/i }))

    await waitFor(() => expect(roomWidth(container)).toBeCloseTo(startWidth + 0.1, 2))
    expect(revision(container)).not.toBe(startRevision)
    for (const id of ['BOQ', 'STRUCTURAL']) expect(container.querySelector(`[data-downstream-status="${id}"]`)!.getAttribute('data-downstream-state')).toBe('STALE UPSTREAM DATA')
    expect(container.querySelector('[data-downstream-summary]')!.textContent).toContain('STALE UPSTREAM DATA')
    expect(window.localStorage.getItem('ferrum-project-state-v1')).toContain('int-v0')

    fireEvent.click(screen.getByRole('button', { name: /undo last plan edit/i }))
    await waitFor(() => expect(roomWidth(container)).toBeCloseTo(startWidth, 2))
    expect(revision(container)).toBe(startRevision)
    expect(container.querySelector('[data-downstream-status="BOQ"]')!.getAttribute('data-downstream-state')).toBe('CURRENT')

    fireEvent.click(screen.getByRole('button', { name: /redo plan edit/i }))
    await waitFor(() => expect(roomWidth(container)).toBeCloseTo(startWidth + 0.1, 2))
  })

  it('cosmetic-only state changes leave the geometry revision and downstream status untouched', async () => {
    const { container } = await openPlan()
    const start = revision(container)
    fireEvent.click(container.querySelector('[data-wall-select="f1-ext-north"]')!)
    fireEvent.click(screen.getByRole('tab', { name: /3D/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    expect(revision(container)).toBe(start)
    expect(container.querySelector('[data-downstream-status="BOQ"]')!.getAttribute('data-downstream-state')).toBe('CURRENT')
  })

  it('restores saved wall moves on reload and reads a pre-wall project state without crashing', async () => {
    window.localStorage.setItem('ferrum-project-state-v1', JSON.stringify({ version: 1, revision: 4, updatedAt: '', source: 'old', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 } }))
    const first = await openPlan()
    const original = roomWidth(first.container)
    first.unmount()
    window.localStorage.setItem('ferrum-project-state-v1', JSON.stringify({ version: 1, revision: 5, updatedAt: '', source: 'old', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 }, openingEdits: {}, wallOffsets: { 'int-v0': 1 } }))
    const second = await openPlan()
    await waitFor(() => expect(roomWidth(second.container)).toBeCloseTo(original + 1, 2))
  })

  it('ignores malformed wall offsets in storage', async () => {
    window.localStorage.setItem('ferrum-project-state-v1', JSON.stringify({ version: 1, revision: 1, updatedAt: '', source: 'x', parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 }, wallOffsets: { 'int-v0': 'a lot', constructor: 4 } }))
    const { container } = await openPlan()
    expect(Number.isFinite(roomWidth(container))).toBe(true)
  })
})
