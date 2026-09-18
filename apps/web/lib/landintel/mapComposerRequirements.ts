export type MapComposerRequirement = {
  id: string
  title: string
  requirement: string
  keywords: string[]
}

export const mapComposerRequirements: MapComposerRequirement[] = [
  { id: 'purpose-subject', title: 'Purpose & analysis subject', requirement: 'Use a specific title that states what is being analysed and why the map exists.', keywords: ['map title', 'purpose', 'analysis subject'] },
  { id: 'project-boundary', title: 'Verified project boundary', requirement: 'Use a traceable project or parcel boundary; a screenshot outline cannot substitute for verified geometry.', keywords: ['project boundary', 'parcel geometry'] },
  { id: 'scale-units', title: 'Geometry-derived scale & units', requirement: 'Generate scale intervals and units from the mapped geometry and output size, never from decorative AI text.', keywords: ['scale bar', 'map scale', 'units'] },
  { id: 'north-orientation', title: 'Correct north orientation', requirement: 'Derive north from the map reference system and rotation, with a clear symbol and no redundant label.', keywords: ['north arrow', 'orientation', 'rotation'] },
  { id: 'crs-epsg', title: 'CRS / EPSG identification', requirement: 'State the coordinate reference system and EPSG identifier used for the exported map.', keywords: ['crs', 'epsg', 'projection'] },
  { id: 'source-dates', title: 'Sources & observation dates', requirement: 'List the source and observation date for every decision-relevant dataset, plus map issue date and revision.', keywords: ['data source', 'observation date', 'issue date', 'revision'] },
  { id: 'active-layer-legend', title: 'Active-layer legend', requirement: 'Generate the legend from actual visible layers and classifications so labels cannot drift from the map.', keywords: ['legend', 'active layers', 'classification'] },
  { id: 'locator-inset', title: 'Location inset when required', requirement: 'Add a locator inset when the main frame does not establish the site’s regional context.', keywords: ['locator inset', 'regional context'] },
  { id: 'label-collisions', title: 'Collision-checked labels', requirement: 'Check label placement, leader lines, contrast and hierarchy; suppress noise instead of obscuring geometry.', keywords: ['labels', 'collision', 'leader line', 'contrast'] },
  { id: 'confidence-unknown', title: 'Confidence & UNKNOWN treatment', requirement: 'Show uncertainty, conflicts and missing evidence explicitly and never fill gaps with plausible-looking text.', keywords: ['confidence', 'unknown', 'data conflict'] },
  { id: 'indicative-status', title: 'INDICATIVE qualification', requirement: 'Mark sample or unverified maps INDICATIVE and prevent them from being presented as approval or decision-grade evidence.', keywords: ['indicative', 'sample data', 'unverified'] },
]
