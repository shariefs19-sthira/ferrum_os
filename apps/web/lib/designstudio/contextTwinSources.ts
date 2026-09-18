export type ContextSourceAuthority = "CONTROL" | "ANALYTICAL" | "CONTEXT" | "VISUAL-ONLY"
export type ContextSourceStatus = "PRIMARY-OPEN" | "FALLBACK-OPEN" | "OPTIONAL-SERVICE" | "PROJECT-REQUIRED"

export type ContextTwinSource = {
  id: string
  label: string
  status: ContextSourceStatus
  authority: ContextSourceAuthority
  supplies: string
  limitation: string
  licence: string
}

/**
 * Data hierarchy for the DesignStudio context twin.
 *
 * The order is deliberate: visual fidelity never outranks survey authority.
 * Provider meshes and community building data can inform context and analysis,
 * but cannot silently become the project boundary or measurable design base.
 */
export const contextTwinSources: ContextTwinSource[] = [
  {
    id: "project-survey",
    label: "Project survey / cadastral evidence",
    status: "PROJECT-REQUIRED",
    authority: "CONTROL",
    supplies: "Boundary, control points, levels and measured existing geometry",
    limitation: "Must be supplied and accepted for the project; no global map source can replace it.",
    licence: "Project-specific",
  },
  {
    id: "overture-buildings",
    label: "Overture Maps Buildings",
    status: "PRIMARY-OPEN",
    authority: "CONTEXT",
    supplies: "Global building footprints and parts, with height, floor and roof attributes where present",
    limitation: "Coverage and attributes vary. Missing height, floors, facade and roof fields remain UNKNOWN.",
    licence: "ODbL with source attribution requirements",
  },
  {
    id: "openstreetmap",
    label: "OpenStreetMap direct",
    status: "FALLBACK-OPEN",
    authority: "CONTEXT",
    supplies: "Buildings, roads, access and community-authored feature tags",
    limitation: "Community coverage is uneven and is not survey evidence.",
    licence: "ODbL; attribution and share-alike controls apply",
  },
  {
    id: "qualified-terrain",
    label: "Qualified DTM / DSM / LiDAR",
    status: "PROJECT-REQUIRED",
    authority: "ANALYTICAL",
    supplies: "Terrain, obstruction, slope, drainage and level context",
    limitation: "Usability depends on capture date, classification, CRS, vertical datum, resolution and accuracy.",
    licence: "Source-specific",
  },
  {
    id: "google-photorealistic",
    label: "Google Photorealistic 3D Tiles",
    status: "OPTIONAL-SERVICE",
    authority: "VISUAL-ONLY",
    supplies: "High-fidelity visual urban context where provider coverage exists",
    limitation: "Not survey-grade; cannot control dimensions, setbacks, levels or window placement.",
    licence: "Provider terms, attribution, quota and redistribution restrictions",
  },
]

export type AnalysisEngine = {
  id: string
  label: string
  purpose: string
  decisionState: "CHECK" | "SIMULATION" | "SPECIALIST-REVIEW"
}

export const contextAnalysisEngines: AnalysisEngine[] = [
  {
    id: "bee-ens",
    label: "India pack · BEE Eco Niwas Samhita",
    purpose: "Indian residential envelope, daylight potential and natural-ventilation checks",
    decisionState: "CHECK",
  },
  {
    id: "radiance",
    label: "Radiance / Honeybee",
    purpose: "Daylight, luminance, glare and facade-opening option simulation",
    decisionState: "SIMULATION",
  },
  {
    id: "energyplus",
    label: "EnergyPlus / OpenStudio",
    purpose: "Thermal, envelope and whole-building energy option simulation",
    decisionState: "SIMULATION",
  },
  {
    id: "openfoam",
    label: "OpenFOAM",
    purpose: "Bounded wind and outdoor/indoor airflow studies where justified",
    decisionState: "SPECIALIST-REVIEW",
  },
]
