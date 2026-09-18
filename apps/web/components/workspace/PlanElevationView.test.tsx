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
})
