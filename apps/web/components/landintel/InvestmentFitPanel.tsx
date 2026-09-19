"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { safeGetJson, safeSet } from "../../lib/safeStorage"
import { convertArea, kmAndMiles, metresAndFeet } from "../../lib/units"
import { BANDS, CONFIDENCE, SCORE_WEIGHTS } from "../../lib/landintel/investmentFit/questions"
import { activePrefs, CATEGORIES, DEFAULT_CHOSEN, DEFAULT_VALUES, formatPref, prefById, toRequirement, usedPreferences, type PrefDef, type PrefValue, type PrefValues } from "../../lib/landintel/investmentFit/registry"
import { sanitizeSuggestion, SUGGESTION_MAX } from "../../lib/landintel/investmentFit/suggestion"
import { analyseSample, SAMPLE_LABEL } from "../../lib/landintel/investmentFit/stubEngine"
import type { FitFacts, FitResult } from "../../lib/landintel/investmentFit/types"

export type InvestmentFitLayout = "wide" | "stacked" | "compact"
export type DetailsMode = "inline" | "modal" | "side"

const AREA_LABELS = [["sqm", "m²"], ["sqft", "sq ft"], ["cent", "cents"], ["guntha", "guntha"], ["ground", "ground"], ["acre", "acres"]] as const
const SETS_KEY = "ferrum-investfit-sets-v1"
const fmt = (x: number, d = 2) => x.toLocaleString("en-IN", { maximumFractionDigits: d })
const field = "min-h-11 w-full rounded-relume border border-relume-border bg-relume-surface px-3 text-base text-relume-ink"
const chip = "inline-flex min-h-6 items-center rounded-full border border-relume-border bg-relume-surface-secondary px-2 text-xs font-medium text-relume-muted"
const btn = "inline-flex min-h-11 items-center justify-center rounded-relume border border-relume-border bg-relume-surface px-3 text-sm font-medium text-relume-command"
const BAND_LABEL = { strong: "Strong fit", moderate: "Moderate fit", weak: "Weak fit" } as const
const CONSUMER = { suit: "Suits the stated use", budget: "Fit to budget", return: "Fit to target return", verdict: "Overall step" } as const

export function AreaAllUnits({ sqm, label }: { sqm: number; label?: string }) {
  const a = convertArea(sqm)
  return (
    <p className="text-sm text-relume-muted" data-area-all-units>
      {label ? <span className="font-medium text-relume-ink">{label}: </span> : null}
      {AREA_LABELS.map(([k, l], i) => <span key={k}>{i ? " · " : ""}{fmt(a[k], k === "acre" ? 3 : 2)} {l}</span>)}
    </p>
  )
}

function Meter({ value, max, label, ticks }: { value: number; max: number; label: string; ticks?: number[] }) {
  return (
    <div role="img" aria-label={label} className="relative h-2 w-full overflow-hidden rounded-full bg-relume-surface-muted">
      <div className="h-full bg-relume-command" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      {ticks?.map((t) => <span key={t} className="absolute top-0 h-full w-px bg-relume-steel" style={{ left: `${(t / max) * 100}%` }} />)}
    </div>
  )
}

function Confidence({ c }: { c: number }) {
  const tier = c >= CONFIDENCE.confirm ? "high" : c >= CONFIDENCE.insufficient ? "medium, confirm" : "low, do not rely"
  return <span className={chip}>Confidence {Math.round(c * 100)}% ({tier})</span>
}

// ---------- preference input (registry-driven) ----------
function PrefField({ def, value, onChange, idBase }: { def: PrefDef; value: PrefValue | undefined; onChange: (v: PrefValue | undefined) => void; idBase: string }) {
  const id = `${idBase}-${def.id}`
  const num = (s: string) => (s.trim() === "" || Number.isNaN(Number(s)) ? undefined : Number(s))
  if (def.input === "boolean") return <label className="flex min-h-11 items-center gap-3 text-sm text-relume-ink"><input type="checkbox" className="h-5 w-5" checked={value === true} onChange={(e) => onChange(e.target.checked)} />{def.label}</label>
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-relume-ink">{def.label}{def.unit && def.input === "number" ? ` (${def.unit})` : ""}</label>
      {def.input === "select" ? (
        <select id={id} className={field} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value === "" && def.id !== "zone" ? undefined : e.target.value)}>
          <option value="">Not stated</option>{def.options?.filter((o) => o.value !== "").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={id} inputMode="decimal" className={field} value={typeof value === "number" ? value : ""} onChange={(e) => onChange(num(e.target.value))} />
      )}
      {def.input === "area" && typeof value === "number" ? <div className="mt-1"><AreaAllUnits sqm={value} /></div> : null}
      {def.input === "length" && typeof value === "number" ? <p className="mt-1 text-sm text-relume-muted">{fmt(metresAndFeet(value).metres)} m · {fmt(metresAndFeet(value).feet)} ft</p> : null}
      {def.input === "distance" && typeof value === "number" ? <p className="mt-1 text-sm text-relume-muted">{fmt(kmAndMiles(value).km)} km · {fmt(kmAndMiles(value).mi)} mi</p> : null}
      {def.input === "area" && typeof value !== "number" ? <p className="mt-1 text-sm text-relume-muted">Entered in m²; shown in m², sq ft, cents, guntha, ground and acres.</p> : null}
      {def.input === "length" && typeof value !== "number" ? <p className="mt-1 text-sm text-relume-muted">Entered in metres; shown with feet.</p> : null}
      {def.input === "distance" && typeof value !== "number" ? <p className="mt-1 text-sm text-relume-muted">Entered in km; shown with miles.</p> : null}
    </div>
  )
}

// ---------- true modal (page behind inert, focus trapped, Escape closes, focus returns) ----------
function TrueModal({ onClose, titleId, children }: { onClose: () => void; titleId: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const host = ref.current
    const others = Array.from(document.body.children).filter((el) => el !== host) as HTMLElement[]
    others.forEach((el) => { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true") })
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    host?.querySelector<HTMLElement>("[data-modal-close]")?.focus()
    return () => {
      others.forEach((el) => { el.removeAttribute("inert"); el.removeAttribute("aria-hidden") })
      document.body.style.overflow = prevOverflow
      opener?.focus()
    }
  }, [])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); return }
    if (e.key !== "Tab") return
    const f = Array.from(ref.current?.querySelectorAll<HTMLElement>("button, [href], input, select, summary, [tabindex]:not([tabindex='-1'])") ?? []).filter((x) => !x.hasAttribute("disabled"))
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return createPortal(
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center bg-relume-command/60 p-2 sm:p-6" onKeyDown={onKey} data-fit-modal>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-full w-full max-w-3xl overflow-y-auto rounded-relume bg-relume-surface p-4 sm:p-6">{children}</div>
    </div>, document.body)
}

// ---------- how the score was reached ----------
function Details({ result, facts, titleId, onClose, showClose }: { result: FitResult; facts: FitFacts; titleId: string; onClose: () => void; showClose: boolean }) {
  const j = [
    { t: "Suits the stated use", h: `${Math.round(result.suit.probability * 100)}% likely`, c: result.suit.confidence, w: result.suit.why, cited: result.suit.cited },
    { t: "Fit to budget", h: `${result.budget.score} of ${result.budget.levels}`, c: result.budget.confidence, w: result.budget.why, cited: result.budget.cited },
    { t: "Fit to target return", h: `${result.ret.score} of ${result.ret.levels}`, c: result.ret.confidence, w: result.ret.why, cited: result.ret.cited },
    { t: "Overall step", h: result.verdict.choice.replace(/-/g, " "), c: result.verdict.confidence, w: result.verdict.why, cited: result.verdict.cited },
  ]
  return (
    <div className="space-y-4" data-fit-details>
      <div className="flex items-start justify-between gap-2">
        <h3 id={titleId} className="font-heading text-lg font-semibold text-relume-ink">How was this score reached?</h3>
        {showClose ? <button type="button" data-modal-close className={btn} onClick={onClose}>Close</button> : null}
      </div>
      <section aria-label="Score arithmetic"><h4 className="text-sm font-semibold text-relume-ink">The arithmetic</h4>
        {result.breakdown ? <p className="text-sm text-relume-ink" data-fit-formula>{result.breakdown.formula} (weights suit {SCORE_WEIGHTS.suit}, budget {SCORE_WEIGHTS.budget}, return {SCORE_WEIGHTS.ret}; bands: strong from {BANDS.strong}, moderate from {BANDS.moderate})</p>
          : <p className="text-sm text-relume-ink">No score: too many key facts are UNKNOWN, so no number is produced.</p>}</section>
      <section aria-label="Preferences used"><h4 className="text-sm font-semibold text-relume-ink">Your preferences used ({result.requirementUsed.length})</h4>
        <ul className="mt-1 flex flex-wrap gap-2">{result.requirementUsed.map((p) => <li key={p.id} className={chip}>{p.label}: {p.value} → {CONSUMER[p.consumedBy as keyof typeof CONSUMER]}</li>)}</ul>
        <p className="mt-1 text-xs text-relume-muted">The SAMPLE stub weighs only the core preferences; the rest are recorded in the state text.</p></section>
      <section aria-label="Judgments"><h4 className="text-sm font-semibold text-relume-ink">Judgments</h4>
        <ul>{j.map((x) => (
          <li key={x.t} className="border-t border-relume-border py-3 first:border-t-0" data-judgment>
            <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-semibold text-relume-ink">{x.t}</span><span className="text-sm text-relume-ink">{x.h}</span></div>
            <div className="mt-1"><Confidence c={x.c} /></div>
            <p className="mt-1 text-sm text-relume-ink"><span className="font-medium">Why: </span>{x.w}</p>
            <ul className="mt-1 flex flex-wrap gap-2" aria-label="Facts relied on">{x.cited.map((c) => <li key={c.label} className={chip}>{c.label}: {c.value}</li>)}</ul>
          </li>))}</ul></section>
      <section aria-label="Facts and freshness"><h4 className="text-sm font-semibold text-relume-ink">Facts relied on</h4>
        <p className="text-sm text-relume-muted">{[facts.district, facts.state].filter(Boolean).join(", ") || "Location UNKNOWN"} · Land use {facts.landUse ?? "UNKNOWN"} · Zone {facts.zone ?? "UNKNOWN"}</p>
        {facts.areaSqm !== null ? <AreaAllUnits sqm={facts.areaSqm} label="Area" /> : <p className="text-sm text-relume-muted">Area UNKNOWN</p>}
        <p className="text-sm text-relume-muted">Source: {facts.provenance ? `${facts.provenance.source}, ${facts.provenance.vintage}, status ${facts.provenance.status}` : "UNKNOWN"}</p></section>
      <section aria-label="Gaps"><h4 className="text-sm font-semibold text-relume-ink">UNKNOWN gaps</h4><p className="text-sm text-relume-ink" data-fit-gaps>{result.unknowns.length ? result.unknowns.join(", ") : "None among the key facts."}</p></section>
      <section aria-label="Deterministic figures" data-fit-deterministic><h4 className="text-sm font-semibold text-relume-ink">Deterministic figures behind the judgments</h4>
        <p className="text-sm text-relume-ink">Feasibility score {result.feasibilityScore === null ? "UNKNOWN" : `${result.feasibilityScore} / 100`} (fallback if the model is unavailable){result.projection ? ` · ${fmt(result.projection.growthPct)}% a year over ${result.projection.years} years: INR ${fmt(result.projection.futureValueCr, 3)} crore projected, gain INR ${fmt(result.projection.gainCr, 3)} crore` : ""}</p></section>
      <section aria-label="Versions"><h4 className="text-sm font-semibold text-relume-ink">Versions used</h4>
        <p className="text-xs text-relume-muted" data-fit-versions>Model: {result.versions.model} · Question set {result.versions.questionSet} · Preference registry {result.versions.registry} · Thresholds {result.versions.thresholds}</p></section>
    </div>
  )
}

export default function InvestmentFitPanel({ facts, layout = "wide", detailsMode = "inline", initialChosen = [], initialValues = {}, initiallyAnalysed = false, initiallyOpenDetails = false, initiallyOpenSuggest = false }: { facts: FitFacts; layout?: InvestmentFitLayout; detailsMode?: DetailsMode; initialChosen?: string[]; initialValues?: PrefValues; initiallyAnalysed?: boolean; initiallyOpenDetails?: boolean; initiallyOpenSuggest?: boolean }) {
  const uid = useId()
  const [chosen, setChosen] = useState<string[]>(initialChosen)
  const [values, setValues] = useState<PrefValues>(initialValues)
  const [notes, setNotes] = useState<string[]>([])
  const [q, setQ] = useState("")
  const [allChips, setAllChips] = useState(false)
  const [setName, setSetName] = useState("")
  const [sets, setSets] = useState<Record<string, { chosen: string[]; values: PrefValues }>>({})
  const [result, setResult] = useState<FitResult | null>(() => (initiallyAnalysed ? analyseSample(facts, toRequirement(initialValues), usedPreferences(initialValues)) : null))
  const [open, setOpen] = useState(initiallyOpenDetails)
  const [sugg, setSugg] = useState("")
  const [suggMsg, setSuggMsg] = useState<string | null>(null)
  useEffect(() => { setSets(safeGetJson(SETS_KEY, {})) }, [])
  const openerRef = useRef<HTMLButtonElement>(null)
  const id = (n: string) => `${uid}-${n}`
  const hasValues = Object.keys(values).length > 0
  const reg = useMemo(() => activePrefs(), [])
  const invalidate = () => { setResult(null); setOpen(false) }
  const choose = (pid: string) => { setChosen((c) => (c.includes(pid) ? c : [...c, pid])); setQ(""); invalidate() }
  const unchoose = (pid: string) => { setChosen((c) => c.filter((x) => x !== pid)); setValues((v) => { const n = { ...v }; delete n[pid]; return n }); invalidate() }
  const setVal = (pid: string, v: PrefValue | undefined) => { setValues((s) => { const n = { ...s }; if (v === undefined) delete n[pid]; else n[pid] = v; return n }); invalidate() }
  const matches = q.trim() ? reg.filter((p) => !chosen.includes(p.id) && `${p.label} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : []
  const unchosen = reg.filter((p) => !chosen.includes(p.id))
  const chipsShown = allChips ? chosen : chosen.slice(0, 8)
  const saveSet = () => { const name = setName.trim(); if (!name) return; const next = { ...sets, [name]: { chosen, values } }; setSets(next); safeSet(SETS_KEY, JSON.stringify(next)); setSetName("") }
  const loadSet = (name: string) => { const s = sets[name]; if (s) { setChosen(s.chosen); setValues(s.values); invalidate() } }
  const analyse = () => { if (!hasValues) return; setResult(analyseSample(facts, toRequirement(values), usedPreferences(values))) }
  const sideOpen = open && detailsMode === "side" && result
  const detailsId = id("details-title")

  const prefs = (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); analyse() }} aria-label="Investment preferences" data-fit-prefs>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-relume-ink">Your preferences <span className="text-sm font-normal text-relume-muted" data-chosen-count>({chosen.length} chosen)</span></h3>
        <button type="button" className={btn} onClick={() => { setChosen([...DEFAULT_CHOSEN]); setValues({ ...DEFAULT_VALUES }); invalidate() }}>Use suggested defaults</button>
      </div>
      <div>
        <label htmlFor={id("q")} className="mb-1 block text-sm font-medium text-relume-ink">Search or add a preference</label>
        <input id={id("q")} type="search" className={field} placeholder="For example road width, flood, metro" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        {q.trim() ? (
          <ul className="mt-1 space-y-1" aria-label="Matching preferences">
            {matches.map((p) => <li key={p.id}><button type="button" className={`${btn} w-full justify-between`} onClick={() => choose(p.id)}><span>Add {p.label}</span><span className="text-xs text-relume-muted">{p.category}</span></button></li>)}
            <li><button type="button" className={`${btn} w-full justify-start`} onClick={() => { setNotes((n) => [...n, q.trim()]); setQ(""); invalidate() }}>Add &ldquo;{q.trim()}&rdquo; as a note (draft, needs review)</button></li>
          </ul>) : null}
      </div>
      <div>
        <ul className="flex flex-wrap gap-2" aria-label="Chosen preferences" data-chips>
          {chipsShown.map((pid) => { const d = prefById(pid)!; return (
            <li key={pid}><button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-relume-border bg-relume-surface-secondary px-3 text-sm text-relume-ink" onClick={() => unchoose(pid)} aria-label={`Remove ${d.label}`}>{d.label}{pid in values ? `: ${formatPref(d, values[pid])}` : ""}<span aria-hidden="true">×</span></button></li>) })}
          {notes.map((n, i) => <li key={`n${i}`} className={`${chip} min-h-11`}>Note: {n}</li>)}
        </ul>
        {chosen.length > 8 ? <button type="button" className={`${btn} mt-2`} onClick={() => setAllChips((a) => !a)} aria-expanded={allChips}>{allChips ? "Show fewer" : `Show all ${chosen.length} chosen`}</button> : null}
      </div>
      <div className="space-y-2" data-fit-categories>
        {CATEGORIES.map((cat, ci) => {
          const items = chosen.map((pid) => prefById(pid)!).filter((d) => d && d.category === cat)
          if (!items.length) return null
          return (
            <details key={cat} open={ci === 0} className="rounded-relume border border-relume-border">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between px-3 text-sm font-semibold text-relume-ink"><span>{cat}</span><span className="text-xs font-normal text-relume-muted">{items.length}</span></summary>
              <div className="space-y-3 p-3">{items.map((d) => <PrefField key={d.id} def={d} value={values[d.id]} onChange={(v) => setVal(d.id, v)} idBase={id("p")} />)}</div>
            </details>)
        })}
      </div>
      <details className="rounded-relume border border-relume-border" data-more-prefs>
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-relume-command">More preferences ({unchosen.length} available)</summary>
        <div className="space-y-3 p-3">
          {CATEGORIES.map((cat) => { const items = unchosen.filter((p) => p.category === cat); return items.length ? (
            <div key={cat}><p className="text-xs font-semibold uppercase tracking-wide text-relume-muted">{cat}</p>
              <ul className="mt-1 flex flex-wrap gap-2">{items.map((p) => <li key={p.id}><button type="button" className={btn} onClick={() => choose(p.id)}>+ {p.label}</button></li>)}</ul></div>) : null })}
        </div>
      </details>
      <details className="rounded-relume border border-relume-border" data-suggest open={initiallyOpenSuggest}>
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-relume-command">Suggest a preference</summary>
        <div className="space-y-2 p-3">
          <p className="text-sm text-relume-muted">Cannot find what matters to you? Describe it. The Ferrum team checks it and, if it can be measured, adds it for everyone. Until it is approved it is not used in any score.</p>
          <label htmlFor={id("sg")} className="block text-sm font-medium text-relume-ink">Your suggestion (max {SUGGESTION_MAX} characters)</label>
          <input id={id("sg")} className={field} value={sugg} maxLength={SUGGESTION_MAX + 40} onChange={(e) => { setSugg(e.target.value); setSuggMsg(null) }} />
          <button type="button" className={btn} onClick={() => { const r = sanitizeSuggestion(sugg); setSuggMsg(r.ok ? "Submitted (SAMPLE, nothing was sent). Status: submitted. You will see its status here once reviewed." : r.reason === "policy" ? "This cannot be added: preferences based on protected personal attributes are not accepted." : r.reason === "too-long" ? `Please keep it under ${SUGGESTION_MAX} characters.` : r.reason === "injection" ? "Please describe the preference in plain words only." : "Type a suggestion first."); if (r.ok) setSugg("") }}>Submit suggestion</button>
          {suggMsg ? <p className="text-sm text-relume-ink" role="status" data-suggest-msg>{suggMsg}</p> : null}
        </div>
      </details>
      <div className="flex flex-wrap items-end gap-2" data-saved-sets>
        <div className="min-w-0 flex-1"><label htmlFor={id("set")} className="mb-1 block text-sm font-medium text-relume-ink">Saved sets</label>
          <select id={id("set")} className={field} value="" onChange={(e) => loadSet(e.target.value)}><option value="">{Object.keys(sets).length ? "Load a saved set" : "None saved yet"}</option>{Object.keys(sets).map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
        <div className="min-w-0 flex-1"><label htmlFor={id("sn")} className="mb-1 block text-sm font-medium text-relume-ink">Save current as</label><input id={id("sn")} className={field} value={setName} onChange={(e) => setSetName(e.target.value)} /></div>
        <button type="button" className={btn} onClick={saveSet}>Save set</button>
      </div>
      <button type="submit" disabled={!hasValues} className="min-h-11 w-full rounded-relume bg-relume-command px-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Check fit (SAMPLE)</button>
      {!hasValues ? <p className="text-sm text-relume-muted">State at least one preference, or use the suggested defaults.</p> : null}
    </form>
  )

  const scoreCard = result ? (
    <div className="rounded-relume border-2 border-relume-command p-4" data-fit-result aria-live="polite">
      <div className="flex flex-wrap items-center gap-2"><span className={chip} data-indicative>INDICATIVE</span><span className="inline-flex min-h-6 items-center rounded-full border border-relume-accent px-2 text-xs font-semibold text-relume-ink" data-sample-label>{SAMPLE_LABEL}</span></div>
      {result.score === null ? (
        <p className="mt-3 font-heading text-2xl font-semibold text-relume-ink" data-fit-score="none">Not enough information</p>
      ) : (
        <>
          <p className="mt-3 flex items-baseline gap-2"><span className="font-heading text-6xl font-semibold leading-none text-relume-ink" data-fit-score={result.score}>{result.score}</span><span className="text-lg text-relume-muted">/ 100</span></p>
          <p className="mt-1 text-base font-semibold text-relume-ink" data-fit-band>{BAND_LABEL[result.band!]}</p>
          <div className="mt-2"><Meter value={result.score} max={100} ticks={[BANDS.moderate, BANDS.strong]} label={`Score ${result.score} of 100`} /></div>
        </>
      )}
      <p className="mt-3 text-sm text-relume-muted">Indicative only. Not financial, legal or compliance advice.</p>
      <button ref={openerRef} type="button" className={`${btn} mt-3 w-full sm:w-auto`} aria-expanded={open} aria-controls={id("details")} onClick={() => setOpen((o) => !o)} data-fit-details-toggle>How was this score reached?</button>
    </div>
  ) : (
    <div className="rounded-relume border border-dashed border-relume-border p-4 text-sm text-relume-muted" data-fit-placeholder>
      <div className="mb-2 flex flex-wrap gap-2"><span className={chip}>INDICATIVE</span><span className="inline-flex min-h-6 items-center rounded-full border border-relume-accent px-2 text-xs font-semibold text-relume-ink" data-sample-label>{SAMPLE_LABEL}</span></div>
      No score yet. Choose your preferences, then Check fit. You get one indicative score, and one click shows how it was reached.</div>
  )

  const details = result && open ? <Details result={result} facts={facts} titleId={detailsId} onClose={() => { setOpen(false); openerRef.current?.focus() }} showClose={detailsMode === "modal"} /> : null

  return (
    <section className="rounded-relume border border-relume-border bg-relume-surface p-4 sm:p-6" data-investment-fit data-layout={layout} data-details-mode={detailsMode} aria-labelledby={id("h")}>
      <h2 id={id("h")} className="font-heading text-xl font-semibold text-relume-ink">Is this land worth investing in for you?</h2>
      <p className="mt-1 text-sm text-relume-muted">One indicative score from your preferences and the parcel facts. Figures come from Ferrum&apos;s deterministic modules; the judgment only weighs them.</p>
      <div className={`mt-4 grid gap-6 ${layout === "wide" ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}>
        <div>{prefs}</div>
        <div className={`grid content-start gap-4 ${result ? (layout === "wide" ? "order-first lg:order-none" : "order-first") : ""} ${sideOpen && layout === "wide" ? "xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]" : ""}`}>
          <div className="space-y-4">
            {scoreCard}
            {detailsMode === "inline" && details ? <div id={id("details")} className="rounded-relume border border-relume-border p-4">{details}</div> : null}
          </div>
          {detailsMode === "side" && details ? <aside id={id("details")} aria-label="How the score was reached" className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4">{details}</aside> : null}
        </div>
      </div>
      {detailsMode === "modal" && details ? <TrueModal titleId={detailsId} onClose={() => { setOpen(false); openerRef.current?.focus() }}><div id={id("details")}>{details}</div></TrueModal> : null}
    </section>
  )
}
