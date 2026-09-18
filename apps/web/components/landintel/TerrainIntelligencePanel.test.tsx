import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TerrainIntelligencePanel from './TerrainIntelligencePanel'

describe('LandIntel terrain intelligence panel', () => {
  it('shows the governed analysis scope without fabricating terrain evidence', () => {
    render(<TerrainIntelligencePanel />)

    expect(screen.getByText('NO TERRAIN SOURCE CONNECTED')).toBeTruthy()
    expect(screen.getAllByText('Roadmap')).toHaveLength(9)
    expect(screen.getByText('Bare-earth DTM & surface DSM')).toBeTruthy()
    expect(screen.getByText('Slope & elevation analysis')).toBeTruthy()
    expect(screen.getByText('Drainage paths & low points')).toBeTruthy()
    expect(screen.getByText('Access-gradient screening')).toBeTruthy()
    expect(screen.getByText('Cut-and-fill estimation')).toBeTruthy()
    expect(screen.getByText('Canopy & obstruction mapping')).toBeTruthy()
    expect(screen.getByText('Building & road cross-sections')).toBeTruthy()
    expect(screen.getByText('Survey & design-level comparison')).toBeTruthy()
    expect(screen.getByText(/No terrain surface, anomaly, level, volume or suitability conclusion is asserted/)).toBeTruthy()
  })

  it('keeps provenance, validation states and non-claims visible', () => {
    render(<TerrainIntelligencePanel />)

    const evidence = within(screen.getByLabelText('Terrain evidence record'))
    expect(evidence.getByText('Capture date')).toBeTruthy()
    expect(evidence.getByText('Provider')).toBeTruthy()
    expect(evidence.getByText('Resolution / point density')).toBeTruthy()
    expect(evidence.getByText('Classification')).toBeTruthy()
    expect(evidence.getByText('Horizontal CRS')).toBeTruthy()
    expect(evidence.getByText('Vertical datum')).toBeTruthy()
    expect(evidence.getByText('Horizontal / vertical accuracy')).toBeTruthy()
    expect(evidence.getByText('Coverage gaps')).toBeTruthy()
    expect(screen.getByText('Soil bearing capacity or geotechnical suitability')).toBeTruthy()
    expect(screen.getByText('Buried utilities or underground obstructions')).toBeTruthy()
    expect(screen.getByText('Foundation type or structural adequacy')).toBeTruthy()
    expect(screen.getByText('Legal parcel boundaries, title or ownership')).toBeTruthy()
    expect(screen.getByText(/INDICATIVE UNTIL VALIDATED AGAINST A PROJECT SURVEY/)).toBeTruthy()
  })
})

