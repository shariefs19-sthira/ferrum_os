import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RegistryControls from './RegistryControls'
import { getSiteConstraintsEvidence } from '../../lib/parcelIntel/siteConstraints'

const parameters = { plotWidthM: 24, plotDepthM: 40, setbackM: 3, floors: 4 }
const context = { maxFloors: 6, minSetbackM: 1.5, maxSetbackM: 10 }

describe('LandIntel Site Constraints control', () => {
  it('stays compact until selected and retains modified emphasis', () => {
    const onChange = vi.fn()
    render(<RegistryControls product="landintel" parameters={parameters} context={context} onChange={onChange} authorityEvidence={getSiteConstraintsEvidence(null)} />)
    const toggle = screen.getByRole('button', { name: 'Site Constraints' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('heading', { name: 'Authority guidance' })).toBeNull()
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Authority guidance' })).toBeTruthy()
    expect(screen.getAllByText('GAP').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Increase Open space and setback' }))
    expect(onChange).toHaveBeenCalledWith('setbackM', 3.5)
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Site Constraints · modified/ })).toBeTruthy()
  })
})
