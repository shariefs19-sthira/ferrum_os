import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('LandIntel hero composition', () => {
  const source = readFileSync(resolve(process.cwd(), 'app/products/landintel/page.tsx'), 'utf8')

  it('puts the context rail ahead of the lookup and uses the page-width cockpit mode', () => {
    expect(source.indexOf('data-landintel-context-rail')).toBeLessThan(source.indexOf('<UlpinMapExplorer />'))
    expect(source).toContain('layout="product-page"')
    expect(source).toContain('data-landintel-working-row')
    expect(source).not.toContain('max-w-[1728px]')
    expect(source).not.toContain('order-first min-w-0 lg:order-none')
  })

  it('places the auditable suitability layers between parcel finding and forecasting', () => {
    expect(source).toContain('SuitabilityLayerPanel')
    expect(source.indexOf('<UlpinMapExplorer />')).toBeLessThan(source.indexOf('<SuitabilityLayerPanel />'))
    expect(source.indexOf('<SuitabilityLayerPanel />')).toBeLessThan(source.indexOf('data-landintel-forecast-row'))
    expect(source.indexOf('<SuitabilityLayerPanel />')).toBeLessThan(source.indexOf('<MapComposerGate />'))
    expect(source.indexOf('<MapComposerGate />')).toBeLessThan(source.indexOf('data-landintel-forecast-row'))
    expect(source).toContain('<GeotechnicalEvidenceSection />')
  })

  it('wires the geotechnical evidence panel + map-layer legend pair (GeotechnicalEvidenceSection) into the Land theme, not the bare unwired panels', () => {
    // The section owns the persisted generatedFor capture per its own doc
    // comment -- page.tsx must go through it, never render the map-layer
    // legend on its own (which would default generatedFor to null and make
    // staleness unobservable on the live page).
    expect(source).not.toContain('<GeotechnicalMapLayerLegend')
    expect(source).not.toContain('<GeotechnicalIntelligencePanel')
    expect(source.indexOf("id: 'land'")).toBeLessThan(source.indexOf('<GeotechnicalEvidenceSection />'))
    expect(source.indexOf('<GeotechnicalEvidenceSection />')).toBeLessThan(source.indexOf("id: 'access'"))
  })

  it('organizes the evidence surface into all five governed analytical themes', () => {
    expect(source).toContain('EvidenceThemeTabs')
    for (const theme of ["id: 'land'", "id: 'access'", "id: 'environment'", "id: 'regulation'", "id: 'market'"]) {
      expect(source).toContain(theme)
    }
    expect(source).toContain('<AccessConnectivityPanel />')
    expect(source).toContain('<ProximityCatchmentPanel />')
    expect(source).toContain('<MarketContextPanel />')
    expect(source).toContain('nothing is synthesized to fill a gap')
  })
})
