import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { generateStudioPlan } from '../../lib/plan-gen'
import PlanElevationView from './PlanElevationView'

describe('PlanElevationView openings', () => {
  it('selects an opening by pointer and keyboard from the shared plan geometry', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 })
    const onSelectOpening = vi.fn()
    render(<PlanElevationView plan={plan} view="plan" activeFloor={1} onSelectOpening={onSelectOpening} />)
    const door = screen.getAllByRole('button', { name: /select door/i })[0]
    fireEvent.click(door)
    fireEvent.keyDown(door, { key: 'Enter' })
    expect(onSelectOpening).toHaveBeenCalledTimes(2)
    expect(onSelectOpening).toHaveBeenLastCalledWith(expect.stringMatching(/-door$/))
  })

  it('orders physical floor one below the upper storey and exposes a visible focus ring', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 })
    const { container } = render(<PlanElevationView plan={plan} view="front-elevation" activeFloor={1} />)
    const floorOne = container.querySelector('[data-opening-kind="window"]') as SVGRectElement
    const yOne = Number(floorOne.getAttribute('y'))
    render(<PlanElevationView plan={plan} view="front-elevation" activeFloor={2} />)
    const floorTwo = screen.getAllByRole('button', { name: /select window in north elevation/i }).at(-1) as unknown as SVGRectElement
    expect(Number(floorTwo.getAttribute('y'))).toBeLessThan(yOne)
    render(<PlanElevationView plan={plan} view="plan" activeFloor={1} />)
    const marker = screen.getAllByRole('button', { name: /select door/i })[0]
    expect(marker.getAttribute('class')).toContain('focus-visible:stroke')
  })

  it('draws configuration-specific elevation symbols from the shared opening configuration', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 })
    const window = plan.openings!.find((opening) => opening.kind === 'window')!
    const fixed = { ...plan, openings: plan.openings!.map((opening) => opening.id === window.id ? { ...opening, configuration: 'fixed' as const } : opening) }
    const sliding = { ...plan, openings: plan.openings!.map((opening) => opening.id === window.id ? { ...opening, configuration: 'sliding' as const } : opening) }
    const { container, rerender } = render(<PlanElevationView plan={fixed} view="front-elevation" activeFloor={1} />)
    const fixedSymbol = container.querySelector(`[data-opening-id="${window.id}"]`)?.parentElement?.innerHTML
    rerender(<PlanElevationView plan={sliding} view="front-elevation" activeFloor={1} />)
    expect(container.querySelector(`[data-opening-id="${window.id}"]`)?.parentElement?.innerHTML).not.toBe(fixedSymbol)
  })

  it('can fit an allocated canvas row without preserving the normal 24rem minimum', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 })
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} fitAllocatedHeight />)
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('min-h-0')
  })

  it('adds an expanded non-scaling pointer target for every visually thin opening', () => {
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 1 })
    const { container } = render(<PlanElevationView plan={plan} view="plan" activeFloor={1} />)
    const target = container.querySelector('[data-opening-hit-target]') as SVGRectElement
    expect(target).toBeTruthy()
    expect(target.getAttribute('stroke-width')).toBe('44')
    expect(target.getAttribute('vector-effect')).toBe('non-scaling-stroke')
    expect(target.getAttribute('pointer-events')).toBe('all')
  })
})
