import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RegistryControls from './RegistryControls'
import { getSiteConstraintsEvidence } from '../../lib/parcelIntel/siteConstraints'

const parameters = { plotWidthM: 24, plotDepthM: 40, setbackM: 3, floors: 4 }
const context = { maxFloors: 6, minSetbackM: 1.5, maxSetbackM: 10 }

describe('LandIntel Site Constraints control', () => {
  it('renders full controls only inside the explicitly opened task sheet', () => {
    const onChange = vi.fn()
    const onMobileClose = vi.fn()
    const { rerender } = render(<RegistryControls product="landintel" parameters={parameters} context={context} onChange={onChange} authorityEvidence={getSiteConstraintsEvidence(null)} />)
    expect(screen.queryByRole('heading', { name: 'Authority guidance' })).toBeNull()
    expect(document.querySelector('[data-mobile-sheet]')).toBeNull()
    rerender(<RegistryControls product="landintel" parameters={parameters} context={context} onChange={onChange} authorityEvidence={getSiteConstraintsEvidence(null)} mobileOpen onMobileClose={onMobileClose} />)
    expect(document.querySelector('[data-mobile-sheet="controls"]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Authority guidance' })).toBeTruthy()
    expect(screen.getAllByText('GAP').length).toBeGreaterThan(0)
    // No building-design proxy knob (setback/floors) is offered for Land.
    expect(screen.queryByRole('button', { name: 'Increase Open space and setback' })).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onMobileClose).toHaveBeenCalledTimes(1)
  })
})
