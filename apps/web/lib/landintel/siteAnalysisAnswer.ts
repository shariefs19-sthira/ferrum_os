import type { HandoffStatus, SiteHandoff } from './siteAnalysisStore'
import { compassLabel, computeSunGeometry } from './siteSolar'

export const SITE_ANALYSIS_QUERY = /site[- ]analysis|site (context|evidence|gap)s?|missing evidence|evidence gaps?|sun (path|orientation|geometry)/i

export type SiteAnalysisAnswer = { text: string; citations: string[] }

/**
 * Read-only SUTRA answer about the LandIntel site-analysis handoff. It never
 * dispatches a command or changes project state; when the handoff is absent
 * or STALE it says so and declines to use it, and it never states a design
 * recommendation, boundary, or professional determination.
 */
export function answerSiteAnalysis(input: string, handoff: SiteHandoff | null, status: HandoffStatus): SiteAnalysisAnswer | null {
  if (!SITE_ANALYSIS_QUERY.test(input)) return null
  if (!handoff || status.state === 'NONE') {
    return { text: 'No site-analysis context has been handed off from LandIntel. Everything site-specific stays UNKNOWN until evidence is recorded, reviewed and sent there.', citations: ['LandIntel site analysis · not handed off'] }
  }
  if (status.state === 'STALE') {
    return { text: `The handed-off site-analysis context is STALE: ${status.reason} I am not using it. Review and send it again in LandIntel.`, citations: [`LandIntel site analysis · STALE (sent ${handoff.sentAt})`] }
  }
  const sun = handoff.anchor && /sun/i.test(input) ? computeSunGeometry(handoff.anchor.lat) : null
  const june = sun?.find((event) => event.id === 'june-solstice')
  const december = sun?.find((event) => event.id === 'december-solstice')
  const sunText = june?.sunriseAzimuthDeg != null && december?.sunriseAzimuthDeg != null
    ? ` Computed, not measured: sunrise runs from ${Math.round(june.sunriseAzimuthDeg)}° ${compassLabel(june.sunriseAzimuthDeg)} (June) to ${Math.round(december.sunriseAzimuthDeg)}° ${compassLabel(december.sunriseAzimuthDeg)} (December) at the map point; terrain and neighbouring buildings are not modelled.`
    : ''
  return {
    text: `Site-analysis context for ${handoff.parcelLabel}, reviewed ${handoff.reviewedAt} by ${handoff.reviewer}: ${handoff.qualified.length} qualified record${handoff.qualified.length === 1 ? '' : 's'}, ${handoff.heldBackCount} held back, ${handoff.missing.length} topic${handoff.missing.length === 1 ? '' : 's'} still missing, ${handoff.gates.length} professional gates OPEN (${handoff.gates.map((gate) => gate.label.toLowerCase()).join(', ')}). The boundary is UNKNOWN. This is context, not a design recommendation, and it does not change the model.${sunText}`,
    citations: [`LandIntel site analysis · reviewed ${handoff.reviewedAt}`],
  }
}
