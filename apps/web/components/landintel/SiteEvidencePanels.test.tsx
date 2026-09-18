import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AccessConnectivityPanel from './AccessConnectivityPanel'
import MarketContextPanel from './MarketContextPanel'

const evidenceStates = ['SOURCE-VERIFIED', 'INDICATIVE', 'INFERRED', 'UNKNOWN', 'STALE']

describe('LandIntel access and market evidence panels', () => {
  it('keeps access conclusions unknown until a lawful-access source is connected', () => {
    render(<AccessConnectivityPanel />)

    expect(screen.getByText('NO ACCESS SOURCE CONNECTED')).toBeTruthy()
    const recordElement = screen.getByLabelText('Access evidence record')
    expect(recordElement.querySelectorAll('dl > div')).toHaveLength(5)
    expect(recordElement.querySelectorAll('dd.whitespace-nowrap')).toHaveLength(5)
    for (const status of Array.from(recordElement.querySelectorAll('dd.whitespace-nowrap'))) expect(status.textContent).toBe('UNKNOWN')
    for (const state of evidenceStates) expect(screen.getAllByText(state).length).toBeGreaterThan(0)
    expect(screen.getByText(/No travel-time, transit-proximity or utility-availability figure is generated/)).toBeTruthy()
  })

  it('keeps market context separate from valuation and investment claims', () => {
    render(<MarketContextPanel />)

    expect(screen.getByText('NO MARKET SOURCE CONNECTED')).toBeTruthy()
    const recordElement = screen.getByLabelText('Market evidence record')
    expect(recordElement.querySelectorAll('dl > div')).toHaveLength(4)
    expect(recordElement.querySelectorAll('dd.whitespace-nowrap')).toHaveLength(4)
    for (const status of Array.from(recordElement.querySelectorAll('dd.whitespace-nowrap'))) expect(status.textContent).toBe('UNKNOWN')
    expect(screen.getByText('A fair-market or appraised value for the parcel')).toBeTruthy()
    expect(screen.getByText(/INDICATIVE — NOT A VALUATION/)).toBeTruthy()
  })
})
