'use client'

import { useState } from 'react'
import GeotechnicalIntelligencePanel from './GeotechnicalIntelligencePanel'
import GeotechnicalMapLayerLegend from './GeotechnicalMapLayerLegend'
import GeotechObservationIntake from './GeotechObservationIntake'
import { readParcelContext, type ParcelContext } from '../../lib/workspace/parcelContext'

/**
 * Live wiring for the geotechnical evidence + map-layer legend pair on
 * LandIntel's Land theme tab. This is the ONLY place `generatedFor` is
 * produced for the real page -- it is captured ONCE, via a lazy useState
 * initializer, at the moment this section first mounts, and never
 * recomputed on later renders. That is deliberate: `generatedFor` records
 * which site this evidence view was actually prepared for, so that if the
 * user resolves a DIFFERENT site elsewhere in the app while this section
 * stays mounted, GeotechnicalMapLayerLegend's own live subscription
 * notices the active site no longer matches `generatedFor` and reclassifies
 * accordingly (see GeotechnicalMapLayerLegend's own doc comment for the
 * staleness contract). Deriving `generatedFor` from the live parcel context
 * on every render would make staleness impossible to observe, which is
 * exactly the bug this component exists to avoid re-introducing.
 */
export default function GeotechnicalEvidenceSection() {
  const [generatedFor] = useState<ParcelContext | null>(() => readParcelContext())

  return (
    <div className="space-y-6" data-geotechnical-evidence-section>
      <GeotechObservationIntake />
      <GeotechnicalIntelligencePanel />
      <GeotechnicalMapLayerLegend generatedFor={generatedFor} />
    </div>
  )
}
