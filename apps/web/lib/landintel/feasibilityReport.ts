import type { ParcelContext } from '../workspace/parcelContext'

export type EvidenceStatus = 'VERIFIED' | 'INDICATIVE' | 'UNVERIFIED' | 'GAP'
export type ReportDatum = { label: string; value: string | null; status: EvidenceStatus; source: string | null; vintage: string | null }
export type ReportSectionId = 'lookup' | 'zoning' | 'soil-hazard' | 'climate' | 'history' | 'deal-sizing'
export type ReportSection = { id: ReportSectionId; title: string; data: ReportDatum[] }
export type FeasibilityReport = { version: 1; parcel: ParcelContext; generatedAt: string; sections: ReportSection[]; disclaimer: string }

const required: ReportSectionId[] = ['lookup', 'zoning', 'soil-hazard', 'climate', 'history', 'deal-sizing']

export function buildFeasibilityReport(parcel: ParcelContext, sections: ReportSection[], generatedAt: string): FeasibilityReport {
  const byId = new Map(sections.map((section) => [section.id, section]))
  return { version: 1, parcel, generatedAt, sections: required.map((id) => byId.get(id) ?? { id, title: id, data: [{ label: 'Availability', value: null, status: 'GAP', source: null, vintage: null }] }), disclaimer: 'INDICATIVE — due-diligence aid, not an entitlement, engineering opinion, valuation, or investment advice.' }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

export function serializeFeasibilityReport(report: FeasibilityReport): string {
  const sections = report.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.data.map((datum) => `<p><strong>${escapeHtml(datum.label)}</strong>: ${escapeHtml(datum.value ?? 'No value')} <mark>${datum.status}</mark><br><small>${escapeHtml(datum.source ?? 'Source GAP')} · ${escapeHtml(datum.vintage ?? 'Vintage GAP')}</small></p>`).join('')}</section>`).join('')
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Ferrum LandIntel feasibility report</title><body><h1>${escapeHtml(report.parcel.district)}, ${escapeHtml(report.parcel.state)}</h1><p>${escapeHtml(report.disclaimer)}</p>${sections}</body></html>`
}
