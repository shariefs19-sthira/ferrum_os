import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../../lib/plan-gen'
import { BOQ_REVISION_HISTORY_KEY } from '../../lib/workspace/boqRevisionHistory'
import BoqTraceabilityPanel from './BoqTraceabilityPanel'

const plan3Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
const plan4Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 4 })

beforeEach(() => {
  window.localStorage.removeItem(BOQ_REVISION_HISTORY_KEY)
})

describe('BoqTraceabilityPanel checker controls', () => {
  it('uses the governed DRAFT → CHECK REQUIRED → CHECKED lifecycle', () => {
    render(<BoqTraceabilityPanel plan={plan3Floors} />)

    fireEvent.click(screen.getByRole('button', { name: 'CHECK REQUIRED' }))
    expect(document.querySelector('[data-checker-status]')?.textContent).toBe('CHECK REQUIRED')

    fireEvent.click(screen.getByRole('button', { name: 'CHECKED' }))
    expect(document.querySelector('[data-checker-status]')?.textContent).toBe('CHECKED')
  })

  it('keeps the explicit stale hold visible and disables checker actions after upstream geometry changes', () => {
    const { rerender } = render(<BoqTraceabilityPanel plan={plan3Floors} />)
    rerender(<BoqTraceabilityPanel plan={plan4Floors} />)

    expect(screen.getByText(/STALE UPSTREAM DATA — upstream geometry changed/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'CHECK REQUIRED' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'CHECKED' }).hasAttribute('disabled')).toBe(true)
  })
})
