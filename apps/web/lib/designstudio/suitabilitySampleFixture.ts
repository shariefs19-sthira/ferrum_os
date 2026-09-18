import type { ParcelContext } from '../workspace/parcelContext'
import type { BuildingTemplate, ProjectTemplateInputs } from './buildingLibraryKernel'

// Honest sample/demo fixture for the DesignStudio suitability summary panel.
// Every value here is clearly synthetic and exists only so the panel has
// something to show before a real LandIntel parcel is loaded into Project
// Context. It is never presented as a real project evaluation - the panel
// keeps this note (and a "Sample fixture" mode label) visible whenever this
// fixture is in use, and never mixes it with a real ParcelContext.

export const SAMPLE_FIXTURE_NOTE = 'SAMPLE FIXTURE - INDICATIVE. No LandIntel parcel is loaded into Project Context; every value below is synthetic demonstration data, not a real project evaluation.'

export const suitabilitySampleParcel: ParcelContext = {
  version: 1,
  method: 'sample-fixture',
  ulpin: null,
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  area_sqm: 320,
  land_use: 'Residential',
  coordinates: { lat: 12.9762, lng: 77.5946 },
  provenance: { source: 'Ferrum sample fixture - not a real project', vintage: '2026-09-19', status: 'INDICATIVE' },
}

/**
 * Sample geometry inputs, sized to the given template's own envelope so the
 * demo stays internally consistent. Site-hazard fields (soil/wind/seismic/
 * snow) are deliberately left null even in the sample - Ferrum has no
 * standard sample values for those, and inventing plausible-looking numbers
 * for them would misrepresent a screening gap as measured data.
 */
export function buildSampleTemplateInputs(template: BuildingTemplate): ProjectTemplateInputs {
  const grossFloorAreaSqm = Math.round((template.parametricEnvelope.grossFloorAreaSqm.min + template.parametricEnvelope.grossFloorAreaSqm.max) / 2)
  return {
    jurisdictionId: 'india',
    soilBearingKpa: null,
    windSpeedMps: null,
    seismicClass: null,
    snowLoadKpa: null,
    floorCount: template.parametricEnvelope.floorCount.min,
    grossFloorAreaSqm,
    buildingWidthM: 10,
    buildingDepthM: 12,
    storeyHeightM: 3,
    materials: ['reinforced-concrete'],
    deadLoadKpa: 4,
    liveLoadKpa: 2,
    userChanges: [],
  }
}

/**
 * Inputs for a real, loaded parcel. ParcelContext carries no building
 * dimension, structural or site-hazard data anywhere in this codebase today,
 * so every one of those fields stays null rather than being guessed - the
 * corresponding dimensions resolve UNKNOWN with an explicit missing input
 * instead of a fabricated value. `jurisdictionId` is the one exception: the
 * ParcelContext schema itself (ULPIN, state, district) is India-specific, so
 * naming the India jurisdiction pack here reflects the data model, not an
 * invented per-project fact.
 */
export function buildProjectContextTemplateInputs(): ProjectTemplateInputs {
  return {
    jurisdictionId: 'india',
    soilBearingKpa: null,
    windSpeedMps: null,
    seismicClass: null,
    snowLoadKpa: null,
    floorCount: null,
    grossFloorAreaSqm: null,
    buildingWidthM: null,
    buildingDepthM: null,
    storeyHeightM: null,
    materials: [],
    deadLoadKpa: null,
    liveLoadKpa: null,
    userChanges: [],
  }
}
