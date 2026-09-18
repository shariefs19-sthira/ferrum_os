import { describe, expect, it } from 'vitest'
import {
  designImportFormats,
  geometryWarningCatalog,
  getFormatCapability,
  listFormatCapabilities,
} from './designImportCompatRegistry'

const expectedFormatIds = [
  'ifc', 'dxf', 'dwg', 'rvt', 'dgn', 'landxml', 'gbxml', 'bcf', 'saf',
  'step', 'stl', 'obj', 'gltf', 'csv', 'pdf',
]

describe('design import compatibility registry', () => {
  it('covers every required industry format exactly once', () => {
    const ids = designImportFormats.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of expectedFormatIds) {
      expect(ids).toContain(id)
    }
  })

  it('exposes lookup helpers backed by the same data', () => {
    expect(listFormatCapabilities()).toBe(designImportFormats)
    expect(getFormatCapability('ifc')?.label).toBe('IFC (Industry Foundation Classes)')
    expect(getFormatCapability('not-a-format')).toBeUndefined()
  })

  it('is the only format wired to a real, implemented parser (web-ifc 0.0.77, reconciled with apps/web/lib/ifcIntake.ts)', () => {
    const ifc = getFormatCapability('ifc')!
    expect(ifc.parserAvailability).toBe('IMPLEMENTED_METADATA_PARSER')
    expect(ifc.geometryFidelity).toBe('METADATA_AND_ENTITY_COUNTS_ONLY')
    expect(ifc.implementedParser).toEqual({ engine: 'web-ifc', engineVersion: '0.0.77', intakeModule: 'apps/web/lib/ifcIntake.ts' })
    expect(ifc.interoperabilityNote).toContain('VALIDATION REQUIRED')
    expect(ifc.interoperabilityNote).not.toContain('CRS extraction is implemented')
  })

  it('gives every other format no `implementedParser` reference — none is real yet', () => {
    for (const format of designImportFormats) {
      if (format.id === 'ifc') continue
      expect(format.implementedParser).toBeUndefined()
      expect(format.parserAvailability).not.toBe('IMPLEMENTED_METADATA_PARSER')
    }
  })

  it('is truthful about DWG: metadata-only, no geometry access, no future-parser promise', () => {
    const dwg = getFormatCapability('dwg')!
    expect(dwg.parserAvailability).toBe('METADATA_ONLY')
    expect(dwg.geometryFidelity).toBe('NONE_METADATA_ONLY')
    expect(dwg.eligibleForFutureNativeParser).toBe(false)
    expect(dwg.downstreamConsumers).toEqual([])
  })

  it('is truthful about RVT: reference-only, never opened or interpreted', () => {
    const rvt = getFormatCapability('rvt')!
    expect(rvt.parserAvailability).toBe('REFERENCE_ONLY')
    expect(rvt.geometryFidelity).toBe('NONE_REFERENCE_ONLY')
    expect(rvt.eligibleForFutureNativeParser).toBe(false)
    expect(rvt.applicableWarnings).toEqual(['EXTERNAL_REFERENCE_UNRESOLVED'])
  })

  it('never claims a native parser exists for a format beyond the one actually implemented', () => {
    for (const format of designImportFormats) {
      expect(format.interoperabilityNote.toLowerCase()).not.toContain('fully supported')
      expect(format.parserAvailability).not.toBe('NATIVE_PARSER')
    }
  })

  it('caps mesh/geometry formats to requiring units and origin, never a CRS/datum they cannot carry', () => {
    for (const id of ['stl', 'obj']) {
      const format = getFormatCapability(id)!
      expect(format.requirements.crs).toBe('NOT_APPLICABLE')
      expect(format.requirements.datum).toBe('NOT_APPLICABLE')
      expect(format.requirements.origin).toBe('REQUIRED')
    }
  })

  it('treats CSV as attribute/tabular-only, never a geometry source', () => {
    const csv = getFormatCapability('csv')!
    expect(csv.geometryFidelity).toBe('TABULAR_ATTRIBUTES_ONLY')
    expect(csv.downstreamConsumers).not.toContain('RENDER_CACHE')
  })

  it('treats PDF as a document reference with no geometry or attribute extraction', () => {
    const pdf = getFormatCapability('pdf')!
    expect(pdf.geometryFidelity).toBe('NONE_DOCUMENT_ONLY')
    expect(pdf.downstreamConsumers).toEqual([])
  })

  it('every format warning id referenced actually resolves in the shared warning catalog', () => {
    for (const format of designImportFormats) {
      for (const warningId of format.applicableWarnings) {
        expect(geometryWarningCatalog[warningId]).toBeDefined()
      }
    }
  })

  it('every geometry warning definition carries a severity of BLOCKING or ADVISORY', () => {
    for (const def of Object.values(geometryWarningCatalog)) {
      expect(['BLOCKING', 'ADVISORY']).toContain(def.severity)
    }
  })
})
