import type { EvidenceValue, ModelIntakeReport, ParsedObjectType } from './modelIntake'

const MAX_IFC_BYTES = 50 * 1024 * 1024
const unknown = <T>(note: string): EvidenceValue<T> => ({ status: 'UNKNOWN', value: null, note })
const userValue = (value: string, note: string): EvidenceValue<string> => value.trim()
  ? { status: 'USER PROVIDED', value: value.trim(), note }
  : unknown(note)

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('')
}

export async function sha256(bytes: ArrayBuffer): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', bytes))
}

export async function inspectIfcFile(
  file: File,
  declarations: { revision: string; source: string; responsibleParty: string },
): Promise<ModelIntakeReport> {
  if (!file.name.toLowerCase().endsWith('.ifc')) throw new Error('Select an IFC STEP file with the .ifc extension.')
  if (file.size === 0) throw new Error('The selected file is empty.')
  if (file.size > MAX_IFC_BYTES) throw new Error('This browser intake is limited to 50 MB per IFC file.')

  const buffer = await file.arrayBuffer()
  const checksum = await sha256(buffer)
  const WebIfc = await import('web-ifc')
  const api = new WebIfc.IfcAPI()
  // web-ifc resolves relative paths from the lazy-loaded JS chunk. Use an
  // explicit same-origin URL so the vendored MPL-2.0 runtime asset is loaded
  // from public/wasm rather than from a third-party CDN.
  api.SetWasmPath(`${window.location.origin}/wasm/`, true)
  await api.Init()

  let modelID = -1
  try {
    modelID = api.OpenModel(new Uint8Array(buffer), { COORDINATE_TO_ORIGIN: false })
    if (modelID < 0) throw new Error('web-ifc could not open this IFC revision.')
    const parsedObjectTypes: ParsedObjectType[] = api.GetIfcEntityList(modelID)
      .map((type) => ({ type: api.GetNameFromTypeCode(type) || `TYPE_${type}`, count: api.GetLineIDsWithType(modelID, type).size() }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count || left.type.localeCompare(right.type))
    const matrix = api.GetCoordinationMatrix(modelID)
    const origin = matrix.length >= 16 ? [matrix[12] ?? 0, matrix[13] ?? 0, matrix[14] ?? 0] as [number, number, number] : null

    return {
      reportVersion: '1.0', state: 'VALIDATION REQUIRED',
      file: {
        name: file.name, sizeBytes: file.size, mediaType: file.type || 'application/x-step', sha256: checksum,
        revision: userValue(declarations.revision, 'Revision must be confirmed against the project register.'),
        source: userValue(declarations.source, 'Source is a user declaration and has not been independently verified.'),
        responsibleParty: userValue(declarations.responsibleParty, 'Responsible party is a user declaration and is not an approval.'),
      },
      parser: {
        engine: 'web-ifc', engineVersion: '0.0.77',
        schema: { status: 'OBSERVED', value: api.GetModelSchema(modelID) || 'UNKNOWN', note: 'Read directly from the IFC STEP header by web-ifc.' },
        parsedAt: new Date().toISOString(),
      },
      spatialReference: {
        units: readLengthUnit(api, modelID, WebIfc.IFCSIUNIT),
        crs: unknown('Projected CRS/EPSG extraction and verification are not implemented in this intake slice.'),
        verticalDatum: unknown('Vertical datum is not inferred from model elevation or origin.'),
        origin: origin ? { status: 'OBSERVED', value: origin, note: 'web-ifc coordination matrix translation; not checked against survey control.' } : unknown('No coordination matrix translation was returned.'),
        bounds: unknown('Geometry bounds require the forthcoming geometry-viewer pass.'),
      },
      parsedObjectTypes,
      unsupportedEntities: { status: 'NOT EVALUATED', value: null, note: 'A successful parse does not prove every entity is supported by a downstream viewer or exporter.' },
      geometryWarnings: [
        'Geometry rendering and visual inspection were not run in this metadata-intake slice.',
        'Gaps, overlaps, inverted faces, corrupt alignments and cross-source offsets were not evaluated.',
        'Model bounds, CRS and vertical datum remain unresolved.',
      ],
      previousRevisionComparison: {
        status: 'AWAITING PREVIOUS REVISION', previousRevision: null,
        note: 'A prior registered checksum is required before added, removed or changed objects can be compared.',
      },
      approval: { state: 'VALIDATION REQUIRED', reviewer: null, reviewedAt: null, evidence: [] },
      downstreamConsumers: downstreamHolds(),
    }
  } finally {
    if (modelID >= 0) api.CloseModel(modelID)
    api.Dispose?.()
  }
}

function readLengthUnit(api: import('web-ifc').IfcAPI, modelID: number, ifcSiUnit: number): EvidenceValue<string> {
  try {
    const ids = api.GetLineIDsWithType(modelID, ifcSiUnit)
    for (let index = 0; index < ids.size(); index += 1) {
      const unit = api.GetLine(modelID, ids.get(index)) as { UnitType?: { value?: string }; Name?: { value?: string }; Prefix?: { value?: string } }
      if (unit.UnitType?.value === 'LENGTHUNIT') {
        const value = [unit.Prefix?.value, unit.Name?.value].filter(Boolean).join(' ') || 'DECLARED LENGTH UNIT'
        return { status: 'OBSERVED', value, note: 'Read from IFCSIUNIT; must still be checked against known control distances.' }
      }
    }
  } catch { /* fail closed */ }
  return unknown('No supported IFCSIUNIT length declaration was found.')
}

function downstreamHolds(): ModelIntakeReport['downstreamConsumers'] {
  const holds: Array<[ModelIntakeReport['downstreamConsumers'][number]['product'], string]> = [
    ['DesignStudio', 'Visual geometry is not available from this metadata pass.'],
    ['Structura', 'Structural analysis requires validated geometry, units, coordinates and engineering intent.'],
    ['BOQ Pro', 'Quantity extraction requires supported, classified geometry and measurement rules.'],
    ['ProcureHub', 'Procurement cannot consume an unvalidated design revision.'],
    ['Ferrum Projects', 'Coordination may reference this report, but cannot release the model.'],
    ['Machine workflow', 'Machine release requires all six controlled-release checks.'],
  ]
  return holds.map(([product, reason]) => ({ product, state: 'BLOCKED', reason }))
}
