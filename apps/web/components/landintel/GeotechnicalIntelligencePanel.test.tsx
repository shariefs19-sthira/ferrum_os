import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GeotechnicalIntelligencePanel from './GeotechnicalIntelligencePanel'

describe('GeotechnicalIntelligencePanel', () => {
  it('shows unknown screening evidence, project holds and source boundaries', () => {
    render(<GeotechnicalIntelligencePanel />)
    expect(screen.getByText('SCREENING ONLY')).toBeTruthy()
    expect(screen.getByText('0%')).toBeTruthy()
    expect(screen.getAllByText('UNKNOWN').length).toBeGreaterThan(1)
    expect(screen.getByText('Required project evidence')).toBeTruthy()
    expect(screen.getByText('Authority source registry')).toBeTruthy()
    expect(screen.getAllByText('DECLARATIVE ONLY')).toHaveLength(5)
    expect(screen.getByText(/INDICATIVE — REGIONAL SCREENING ONLY/)).toBeTruthy()
  })

  it('does not claim a bearing capacity or foundation design', () => {
    render(<GeotechnicalIntelligencePanel />)
    expect(screen.getByText('Allowable bearing capacity or foundation type')).toBeTruthy()
    expect(screen.getByText('Total or differential settlement')).toBeTruthy()
    expect(screen.getByText(/Project investigation and accountable engineering review remain required/)).toBeTruthy()
  })
})
