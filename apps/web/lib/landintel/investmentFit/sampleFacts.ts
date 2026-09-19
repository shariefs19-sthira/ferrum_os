import type { FitFacts } from './types'

// SAMPLE fixtures for preview and tests only. Not real parcels.
export const SAMPLE_FACTS_FULL: FitFacts = { ulpin: 'SAMPLE-0001', state: 'Karnataka', district: 'Bengaluru Urban', areaSqm: 1200, landUse: 'Residential', zone: 'R2', askingValueCr: 1.6, feasibilityScore: 72, growthPct: 9, provenance: { status: 'INDICATIVE', source: 'SAMPLE fixture', vintage: '2026' } }
export const SAMPLE_FACTS_SPARSE: FitFacts = { ulpin: 'SAMPLE-0002', state: 'Karnataka', district: 'Tumakuru', areaSqm: null, landUse: null, zone: null, askingValueCr: null, feasibilityScore: null, growthPct: null, provenance: { status: 'GAP', source: 'SAMPLE fixture', vintage: '2026' } }
