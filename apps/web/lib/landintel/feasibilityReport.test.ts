import { describe, expect, it } from 'vitest'
import { buildFeasibilityReport, serializeFeasibilityReport, type ReportSection } from './feasibilityReport'
import type { ParcelContext } from '../workspace/parcelContext'

const parcel: ParcelContext = { version: 1, method: 'ulpin', ulpin: 'TN-CHN-0003-2024', state: 'Tamil Nadu', district: 'Chennai', area_sqm: 1200, land_use: 'Residential', coordinates: null, provenance: { source: 'seed', vintage: '2026-09-10', status: 'INDICATIVE' } }

describe('feasibility report', () => {
  it('preserves status and fills every absent section with GAP', () => {
    const input: ReportSection[] = [{ id: 'zoning', title: 'Zoning', data: [{ label: 'FAR', value: null, status: 'GAP', source: null, vintage: null }] }]
    const report = buildFeasibilityReport(parcel, input, '2026-09-10T00:00:00Z')
    expect(report.sections).toHaveLength(6)
    expect(report.sections.find((section) => section.id === 'zoning')?.data[0].status).toBe('GAP')
  })

  it('serializes standalone HTML without status promotion', () => {
    const html = serializeFeasibilityReport(buildFeasibilityReport(parcel, [], '2026-09-10T00:00:00Z'))
    expect(html).toMatch(/^<!doctype html>/)
    expect(html.match(/<mark>GAP<\/mark>/g)).toHaveLength(6)
    expect(html).toContain('INDICATIVE')
  })
})
