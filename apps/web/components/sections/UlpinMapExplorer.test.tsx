import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UlpinMapExplorer from './UlpinMapExplorer'

vi.mock('./ParcelMap', () => ({ default: ({ label }: { label: string }) => <div role="img" aria-label={`Map showing ${label}`} /> }))
vi.mock('../SaveToWorkspaceButton', () => ({ default: () => <button type="button">Save to workspace</button> }))
vi.mock('../../lib/workspace/parcelContext', () => ({ writeParcelContext: vi.fn() }))

const lookupRecord = {
  ulpin: 'KA-BLR-0001-2024',
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  area_sqm: 1500,
  land_use: 'Commercial',
  indicative: true,
  plot_intel: {
    ruleset: {
      version: '2026-09-10',
      source_note: 'Seeded D1 lookup record',
    },
  },
}

describe('UlpinMapExplorer record-card continuity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => lookupRecord }))
  })

  it('replaces preview values in the existing card after lookup', async () => {
    const { container } = render(<UlpinMapExplorer />)
    const previewCard = container.querySelector('[data-ulpin-record-card]')

    expect(previewCard).not.toBeNull()
    expect(screen.getByText('PREVIEW · SAMPLE')).toBeTruthy()
    expect(screen.getByText(/12,917 sq ft/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: lookupRecord.ulpin }))
    fireEvent.click(screen.getByRole('button', { name: 'Lookup' }))

    await waitFor(() => expect(screen.getByText('INDICATIVE LOOKUP')).toBeTruthy())
    expect(container.querySelector('[data-ulpin-record-card]')).toBe(previewCard)
    expect(screen.getByText('Commercial')).toBeTruthy()
    expect(screen.getByText(/16,146 sq ft/)).toBeTruthy()
    expect(screen.getByLabelText(/Source: Seeded D1 lookup record/)).toBeTruthy()
  })
})
