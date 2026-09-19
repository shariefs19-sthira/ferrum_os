import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import SiteAnalysisWorkspace from './SiteAnalysisWorkspace'
import SiteAnalysisContextPanel from '../designstudio/SiteAnalysisContextPanel'
import { PARCEL_CONTEXT_KEY, writeParcelContext, type ParcelContext } from '../../lib/workspace/parcelContext'
import { SITE_ANALYSIS_KEY } from '../../lib/landintel/siteAnalysisStore'
import { answerSiteAnalysis } from '../../lib/landintel/siteAnalysisAnswer'
import { resolveLabelCollisions } from './SiteAnalysisDiagram'

const clock = () => new Date('2026-09-19T10:00:00Z')

const parcelA: ParcelContext = {
  version: 1, method: 'map', ulpin: null, state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1200, land_use: 'Residential',
  coordinates: { lat: 12.9762, lng: 77.5896 }, provenance: { source: 'Map pin', vintage: '2026-09-19', status: 'INDICATIVE' },
}
const parcelB: ParcelContext = { ...parcelA, district: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.52, lng: 73.85 } }

const $ = (container: HTMLElement, selector: string) => container.querySelector(selector)
const $$ = (container: HTMLElement, selector: string) => Array.from(container.querySelectorAll(selector))

function fill(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function addWind(container: HTMLElement, patch: { basis?: string; note?: string; observedOn?: string } = {}) {
  fill('Topic', 'wind')
  fill('Evidence basis', patch.basis ?? 'OBSERVED')
  fill('Observation date', patch.observedOn ?? '2026-09-18')
  fill('Observer / supplier', 'A. Surveyor')
  fill('Source / document reference', 'Field sheet FS-12')
  fireEvent.click($(container, '[data-site-use-map-point]') as HTMLElement)
  fill(/Bearing/, '225')
  fill('What was seen or read', patch.note ?? 'Steady breeze during the visit.')
  fireEvent.click($(container, '[data-site-add-observation]') as HTMLElement)
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('SiteAnalysisWorkspace without a resolved site', () => {
  it('shows UNKNOWN, disables capture and draws nothing', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($(container, '[data-site-anchor-text]')?.textContent).toMatch(/UNKNOWN/)
    expect($(container, '[data-site-form-disabled]')).toBeTruthy()
    expect(($(container, '[data-site-observation-form] fieldset') as HTMLFieldSetElement).disabled).toBe(true)
    expect($(container, '[data-site-diagram-svg]')?.textContent).toMatch(/no map point resolved/i)
    expect($$(container, '[data-observation-id]')).toHaveLength(0)
    expect($(container, '[data-site-sun-layer]')).toBeNull()
  })
})

describe('SiteAnalysisWorkspace with a resolved site', () => {
  beforeEach(() => {
    window.localStorage.setItem(PARCEL_CONTEXT_KEY, JSON.stringify(parcelA))
  })

  it('offers all five modules and reads GAP for every topic until evidence exists', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($$(container, '[data-site-module]').map((node) => node.getAttribute('data-site-module'))).toEqual(['climate', 'physical', 'urban', 'infrastructure', 'cultural'])
    for (const moduleId of ['climate', 'physical', 'urban', 'infrastructure', 'cultural']) {
      fireEvent.click($(container, `[data-site-module="${moduleId}"]`) as HTMLElement)
      const slots = $$(container, '[data-topic-slot]')
      expect(slots.length).toBeGreaterThan(0)
      expect(slots.every((slot) => slot.getAttribute('data-topic-state') === 'GAP')).toBe(true)
      expect($(container, '[data-module-automation]')?.textContent).toMatch(/Automated:/)
    }
  })

  it('does not present the modules as automated when only sun geometry is computed', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($(container, '[data-module-automation]')?.textContent).toMatch(/sun geometry only, COMPUTED/)
    fireEvent.click($(container, '[data-site-module="urban"]') as HTMLElement)
    expect($(container, '[data-module-automation]')?.textContent).toMatch(/Automated: nothing/)
    expect($(container, '[data-topic-slot="statutory-envelope"]')?.textContent).toMatch(/GAP \/ UNKNOWN/)
  })

  it('draws the computed sun layer, stated as computed, and lets its toggle remove it', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($(container, '[data-site-sun-layer]')).toBeTruthy()
    expect($(container, '[data-sun-caption]')?.textContent).toMatch(/Computed sun geometry/)
    expect($(container, '[data-sun-caption]')?.textContent).toMatch(/Not a site measurement/)
    const toggle = $(container, '[data-diagram-toggle="sun"]') as HTMLElement
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect($(container, '[data-site-sun-layer]')).toBeNull()
  })

  it('never draws a boundary, contour, shadow or wind field', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($(container, '[data-site-diagram-svg]')?.textContent).not.toMatch(/boundary outline|contour line/i)
    expect($(container, '[data-site-analysis-diagram] figcaption')?.textContent).toMatch(/context only, not a surveyed boundary/)
    expect($(container, '[data-site-analysis-diagram] figcaption')?.textContent).toMatch(/no plot outline, contour, shadow or wind field is drawn/)
  })

  it('shows an error summary and marks fields invalid on an empty submit', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    fireEvent.click($(container, '[data-site-add-observation]') as HTMLElement)
    expect($(container, '[data-site-error-summary]')?.getAttribute('role')).toBe('alert')
    expect(screen.getByLabelText('Observer / supplier').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('Source / document reference').getAttribute('aria-invalid')).toBe('true')
    expect($$(container, '[data-observation-row]')).toHaveLength(0)
  })

  it('rejects a legal or geotechnical conclusion in the note', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container, { note: 'Bearing capacity is fine and no heritage here.' })
    expect($(container, '[data-site-error-summary]')?.textContent).toMatch(/conclusion this workspace does not record/)
    expect($$(container, '[data-observation-row]')).toHaveLength(0)
  })

  it('records an observation, links it to a diagram marker, and lets its layer toggle hide it', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container)
    expect($(container, '[data-site-form-notice]')?.textContent).toMatch(/Added/)
    const row = $(container, '[data-observation-row]') as HTMLElement
    expect(row.textContent).toMatch(/OBSERVED/)
    expect(row.textContent).toMatch(/A\. Surveyor/)
    expect(row.textContent).toMatch(/Field sheet FS-12/)
    expect(row.textContent).toMatch(/map point, context only/)
    expect(row.textContent).toMatch(/225° SW/)
    expect($(container, '[data-topic-slot="wind"]')?.getAttribute('data-topic-state')).toBe('OBSERVED')
    const id = row.getAttribute('data-observation-row') as string
    expect($(container, `[data-observation-id="${id}"]`)).toBeTruthy()
    expect($(container, `[data-observation-arrow="${id}"]`)).toBeTruthy()
    fireEvent.click($(container, '[data-diagram-toggle="climate"]') as HTMLElement)
    expect($(container, `[data-observation-id="${id}"]`)).toBeNull()
  })

  // Layout tests below measure diagram labels with the same width model the solver uses (jsdom has no text
  // metrics), in diagram-absolute coordinates (walking ancestors' translate(), so they also read the older
  // markup where labels sat inside translated groups).
  const labelBoxes = (container: HTMLElement) => $$(container, '[data-site-diagram-svg] text').map((el) => {
    let x = Number(el.getAttribute('x') ?? 0)
    let y = Number(el.getAttribute('y') ?? 0)
    for (let node = el.parentElement; node && node.tagName.toLowerCase() !== 'svg'; node = node.parentElement) {
      const match = /translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)/.exec(node.getAttribute('transform') ?? '')
      if (match) { x += Number(match[1]); y += Number(match[2]) }
    }
    const fontSize = Number(el.getAttribute('font-size'))
    const width = (el.textContent ?? '').length * fontSize * 0.56
    const anchor = el.getAttribute('text-anchor')
    const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
    return { text: el.textContent ?? '', left, right: left + width, top: y - fontSize * 0.82 * 1.15, bottom: y + fontSize * 1.15 * 0.18 }
  }).filter((box) => box.text !== 'N')
  const overlapping = (container: HTMLElement) => {
    const boxes = labelBoxes(container)
    const hits: string[] = []
    for (let i = 0; i < boxes.length; i += 1) for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]
      const b = boxes[j]
      if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) hits.push(`${a.text} / ${b.text}`)
    }
    return hits
  }
  function addRecord(container: HTMLElement, topic: string, where: 'map-point' | { lat: string; lng: string }) {
    fill('Topic', topic)
    fill('Observation date', '2026-09-18')
    fill('Observer / supplier', 'A. Surveyor')
    fill('Source / document reference', 'FS-9')
    if (where === 'map-point') fireEvent.click($(container, '[data-site-use-map-point]') as HTMLElement)
    else { fill('Latitude', where.lat); fill('Longitude', where.lng) }
    fill('What was seen or read', `Recorded ${topic}.`)
    fireEvent.click($(container, '[data-site-add-observation]') as HTMLElement)
  }

  it('keeps the grouped count and the Map point label clear of each other when records share the map point', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container)
    addWind(container, { basis: 'INFERRED', note: 'Wind probably stronger at the north edge.' })
    expect($(container, '[data-observation-count]')?.textContent).toBe('×2')
    expect($(container, '[data-site-anchor-label]')?.textContent).toBe('Map point')
    expect(overlapping(container)).toEqual([])
  })

  it('separates the Shadow label from the Map point label when a record sits ~26m from the centre', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addRecord(container, 'shadow', { lat: '12.97640', lng: '77.58990' })
    expect($$(container, '[data-site-diagram-svg] text').map((el) => el.textContent)).toContain('Shadow')
    expect(overlapping(container)).toEqual([])
  })

  it('keeps every diagram label clear of every other at all four radii for wind + site climate at the map point and a shadow ~26m away', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addRecord(container, 'wind', 'map-point')
    addRecord(container, 'site-climate', 'map-point')
    addRecord(container, 'shadow', { lat: '12.97640', lng: '77.58990' })
    for (const radius of ['50', '100', '250', '500']) {
      fill('Diagram radius (view only)', radius)
      expect({ radius, hits: overlapping(container) }).toEqual({ radius, hits: [] })
    }
  })

  it('resolveLabelCollisions pushes two labels sharing the same point apart until their boxes no longer overlap', () => {
    const labels = [
      { id: 'a', x: 200, y: 200, text: 'Wind', fontSize: 16, anchor: 'middle' as const, originX: 200, originY: 200 },
      { id: 'b', x: 200, y: 200, text: 'Shadow', fontSize: 16, anchor: 'middle' as const, originX: 200, originY: 200 },
    ]
    const placed = resolveLabelCollisions(labels, [])
    const distance = Math.hypot(placed[0].x - placed[1].x, placed[0].y - placed[1].y)
    expect(distance).toBeGreaterThan(10)
  })

  it('reports a record beyond the diagram radius instead of dropping it silently', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    fill('Topic', 'wind')
    fill('Observation date', '2026-09-18')
    fill('Observer / supplier', 'A. Surveyor')
    fill('Source / document reference', 'FS-1')
    fill('Latitude', '12.99')
    fill('Longitude', '77.6')
    fill('What was seen or read', 'Gusts at the far corner.')
    fireEvent.click($(container, '[data-site-add-observation]') as HTMLElement)
    expect($(container, '[data-off-scale]')?.textContent).toMatch(/lie beyond 100 m \/ 328 ft/)
    expect($(container, '[data-on-diagram]')?.textContent).toBe('Beyond radius')
  })

  it('keeps an inferred record out of the qualified handoff set and never lets it cover the topic', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container, { basis: 'INFERRED' })
    expect($(container, '[data-topic-slot="wind"]')?.getAttribute('data-topic-state')).toBe('INFERRED')
    expect($(container, '[data-count="qualified"]')?.textContent).toBe('0')
    expect($(container, '[data-count="held-back"]')?.textContent).toBe('1')
    expect($(container, '[data-missing-topic="wind"]')?.textContent).toMatch(/INFERRED only/)
    expect(($(container, '[data-site-send-handoff]') as HTMLButtonElement).disabled).toBe(true)
  })

  it('lists missing evidence, all four OPEN gates and states that no design recommendation is produced', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    expect($$(container, '[data-missing-topic]').length).toBe(27)
    expect($(container, '[data-missing-topic="soil-logs"]')?.textContent).toMatch(/Geotechnical observation intake/)
    expect($$(container, '[data-gate]').map((node) => node.getAttribute('data-gate'))).toEqual(['site-visit', 'survey', 'geotechnical', 'authority'])
    expect($(container, '[data-count="gates-open"]')?.textContent).toBe('4 of 4')
    expect($(container, '[data-site-synthesis]')?.textContent).toMatch(/produces no design recommendation/)
  })

  it('gates the handoff on a review of the current snapshot and marks it STALE after any change', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container)
    const send = $(container, '[data-site-send-handoff]') as HTMLButtonElement
    expect(send.disabled).toBe(true)
    expect($(container, '[data-send-blocked]')?.textContent).toMatch(/Review the current synthesis first/)

    fireEvent.click($(container, '[data-site-mark-reviewed]') as HTMLElement)
    expect(screen.getByText('Enter who reviewed this synthesis.')).toBeTruthy()
    expect(send.disabled).toBe(true)

    fill('Reviewer', 'R. Reviewer')
    fireEvent.click($(container, '[data-site-mark-reviewed]') as HTMLElement)
    expect($(container, '[data-review-status]')?.textContent).toMatch(/Reviewed by R\. Reviewer/)
    expect(send.disabled).toBe(false)

    fireEvent.click(send)
    expect($(container, '[data-handoff-status]')?.getAttribute('data-handoff-status')).toBe('CURRENT')
    const stored = JSON.parse(window.localStorage.getItem(SITE_ANALYSIS_KEY) as string)
    expect(stored.handoff.qualified).toHaveLength(1)
    expect(stored.handoff.boundary).toBe('UNKNOWN')
    expect(stored.handoff.designRecommendation).toBe('NOT_PRODUCED')
    expect(stored.handoff.gates.every((gate: { status: string }) => gate.status === 'OPEN')).toBe(true)

    // A further observation changes the evidence: the review is dropped and the handoff is STALE.
    addWind(container, { note: 'Second visit, same breeze.' })
    expect($(container, '[data-handoff-status]')?.getAttribute('data-handoff-status')).toBe('STALE')
    expect($(container, '[data-site-handoff-state]')?.textContent).toMatch(/^STALE/)
    expect($(container, '[data-review-status]')?.textContent).toBe('Not reviewed.')
    expect((($(container, '[data-site-send-handoff]')) as HTMLButtonElement).disabled).toBe(true)
  })

  it('marks the handoff STALE when the active site changes, and withdraws it on request', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container)
    fill('Reviewer', 'R. Reviewer')
    fireEvent.click($(container, '[data-site-mark-reviewed]') as HTMLElement)
    fireEvent.click($(container, '[data-site-send-handoff]') as HTMLElement)
    expect($(container, '[data-handoff-status]')?.getAttribute('data-handoff-status')).toBe('CURRENT')

    act(() => { writeParcelContext(parcelB) })
    expect($(container, '[data-handoff-status]')?.getAttribute('data-handoff-status')).toBe('STALE')
    expect($(container, '[data-handoff-status]')?.textContent).toMatch(/active site changed/)

    fireEvent.click($(container, '[data-site-withdraw-handoff]') as HTMLElement)
    expect($(container, '[data-handoff-status]')?.getAttribute('data-handoff-status')).toBe('NONE')
  })

  it('removes a record and returns its topic to GAP', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(container)
    fireEvent.click(screen.getByRole('button', { name: /Remove Wind observation/ }))
    expect($$(container, '[data-observation-row]')).toHaveLength(0)
    expect($(container, '[data-topic-slot="wind"]')?.getAttribute('data-topic-state')).toBe('GAP')
  })

  it('surfaces a storage refusal instead of pretending the record was saved', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('quota') }
    try { addWind(container) } finally { Storage.prototype.setItem = original }
    expect($(container, '[data-site-form-notice]')?.textContent).toMatch(/Nothing was saved/)
    expect($$(container, '[data-observation-row]')).toHaveLength(0)
  })

  it('keeps every interactive control at least 44px tall by class and free of positive tabindex', () => {
    const { container } = render(<SiteAnalysisWorkspace clock={clock} />)
    for (const control of $$(container, '[data-site-analysis] button:not([disabled])')) {
      if (control.closest('summary')) continue
      expect(control.className).toMatch(/min-h-11/)
    }
    expect($$(container, '[tabindex]').filter((node) => Number(node.getAttribute('tabindex')) > 0)).toHaveLength(0)
  })
})

describe('DesignStudio and SUTRA read-only consumers', () => {
  it('DesignStudio shows UNKNOWN with no handoff and offers no state-changing control', () => {
    window.localStorage.setItem(PARCEL_CONTEXT_KEY, JSON.stringify(parcelA))
    const { container } = render(<SiteAnalysisContextPanel />)
    expect($(container, '[data-site-context-none]')?.textContent).toMatch(/UNKNOWN/)
    expect($$(container, 'button')).toHaveLength(0)
  })

  it('DesignStudio shows the qualified handoff, then withholds it as STALE once evidence changes', () => {
    window.localStorage.setItem(PARCEL_CONTEXT_KEY, JSON.stringify(parcelA))
    const workspace = render(<SiteAnalysisWorkspace clock={clock} />)
    addWind(workspace.container)
    fill('Reviewer', 'R. Reviewer')
    fireEvent.click($(workspace.container, '[data-site-mark-reviewed]') as HTMLElement)
    fireEvent.click($(workspace.container, '[data-site-send-handoff]') as HTMLElement)

    const panel = render(<SiteAnalysisContextPanel />)
    expect($(panel.container, '[data-site-context-current]')?.textContent).toMatch(/Wind/)
    expect($(panel.container, '[data-site-context-current]')?.textContent).toMatch(/Professional gates OPEN/)
    expect($(panel.container, '[data-site-context-current]')?.textContent).toMatch(/UNKNOWN/)

    addWind(workspace.container, { note: 'Another visit.' })
    expect($(panel.container, '[data-site-context-stale]')?.textContent).toMatch(/STALE/)
    expect($(panel.container, '[data-site-context-current]')).toBeNull()
    expect($(panel.container, '[data-site-analysis-context]')?.textContent).not.toMatch(/Steady breeze/)
  })

  it('SUTRA answers only its own site-analysis queries, and declines a missing or STALE handoff', () => {
    expect(answerSiteAnalysis('add one floor', null, { state: 'NONE' })).toBeNull()
    expect(answerSiteAnalysis('what is the site analysis context', null, { state: 'NONE' })?.text).toMatch(/No site-analysis context has been handed off/)
    const handoff = {
      version: 1 as const, parcelKey: 'k', parcelLabel: 'Bengaluru Urban, Karnataka', snapshotHash: 'h', reviewedAt: '2026-09-19', reviewer: 'R', sentAt: '2026-09-19',
      anchor: { lat: 12.9762, lng: 77.5896 }, anchorNote: 'n', qualified: [], heldBackCount: 1, missing: [{ topicId: 'wind', label: 'Wind', reason: 'GAP' }],
      gates: [{ id: 'survey' as const, label: 'Licensed survey', status: 'OPEN' as const }], boundary: 'UNKNOWN' as const, designRecommendation: 'NOT_PRODUCED' as const,
    }
    expect(answerSiteAnalysis('site analysis', handoff, { state: 'STALE', reason: 'The active site changed.' })?.text).toMatch(/STALE.*I am not using it/)
    const current = answerSiteAnalysis('show the site analysis sun path', handoff, { state: 'CURRENT' })
    expect(current?.text).toMatch(/not a design recommendation/)
    expect(current?.text).toMatch(/Computed, not measured: sunrise runs from 66° ENE/)
    expect(current?.citations[0]).toMatch(/reviewed 2026-09-19/)
  })
})
