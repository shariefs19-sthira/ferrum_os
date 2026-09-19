"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getRulesetForState } from "../../lib/parcelIntel/sampleRulesets"
import type { LandUse } from "../../lib/parcelIntel/types"
import { normalizeProfessionalTerms, termsIn } from "../../lib/workspace/vocabulary"
import { commandEvents, isProjectStateCommand, type SutraEvent, type SutraInputSource } from "../../lib/sutra/events"
import { subscribeCockpitSelection, type CockpitSelectionContext } from "../../lib/sutra/selectionContext"
import { useParcelContext } from "../../lib/workspace/parcelContext"
import { useSiteHandoff } from "../../lib/landintel/siteAnalysisStore"
import { answerSiteAnalysis } from "../../lib/landintel/siteAnalysisAnswer"
import { answerProductKnowledge } from "../../lib/ai/productKnowledge"
import { productLabels } from "../../lib/productFeatureRegistry"
import type { CockpitProduct } from "./ProductCockpitPreview"

type Stage = "use" | "floors" | "massing" | "coverage" | "rooms" | "material" | "compliance" | "output"
type Message = { id: number; role: "operator" | "sutra"; text: string; citations?: string[] }
type Recognition = { continuous:boolean; interimResults:boolean; lang:string; start:()=>void; stop:()=>void; onresult:((e:{results:ArrayLike<{0:{transcript:string}}>})=>void)|null; onend:(()=>void)|null; onerror:(()=>void)|null }
type RecognitionConstructor = new()=>Recognition

const stages: Stage[] = ["use","floors","massing","coverage","rooms","material","compliance","output"]
const labels: Record<Stage,string> = { use:"Use", floors:"Floors", massing:"Massing style", coverage:"Setback / coverage", rooms:"Rooms split", material:"Material grade", compliance:"Diligence / permits", output:"Extract / export / share" }
const demoIntents = ["add one floor","set floors 2","set setback 3","show BOQ extract"]
const ruleCitation = "Karnataka 2026.1-SAMPLE · INDICATIVE land-use structure; verify competent-authority records."
const outputCitation = "Workspace export contract · DXF live; IFC queued; local save only."

export default function SutraPanel({ onEvent, activeProduct, defaultGuidedOpen = true }: { onEvent:(event:SutraEvent)=>void; activeProduct?: CockpitProduct; defaultGuidedOpen?: boolean }) {
  const [stage,setStage] = useState<Stage>("use")
  const [history,setHistory] = useState<Stage[]>([])
  const [selected,setSelected] = useState<Partial<Record<Stage,string>>>({})
  const [value,setValue] = useState("")
  const [listening,setListening] = useState(false)
  const [demoPaused,setDemoPaused] = useState(true)
  const [guidedOpen,setGuidedOpen] = useState(defaultGuidedOpen)
  const [messages,setMessages] = useState<Message[]>([{id:0,role:"sutra",text:"Shape the brief one constrained decision at a time. No typing required."}])
  const [pending,setPending] = useState<{command:string;source:SutraInputSource}|null>(null)
  const [selectionContext,setSelectionContext] = useState<CockpitSelectionContext|null>(null)
  const nextId = useRef(1)
  const scrollRef = useRef<HTMLElement | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const composerRef = useRef<HTMLFormElement | null>(null)
  const [headerH,setHeaderH] = useState(0)
  const [composerH,setComposerH] = useState(0)
  const [atTop,setAtTop] = useState(true)
  const [atBottom,setAtBottom] = useState(true)
  // The header and composer are `sticky` inside this single scrolling
  // panel (see the <aside> below) -- everything else (guided chips,
  // message log) scrolls underneath both of them. `scroll-padding-{top,
  // bottom}` on the scroll container, set to each sticky element's own
  // measured height, is what keeps `scrollIntoView`/`scrollTop` targets
  // (the pending-confirm alert, the newest message) from landing
  // partially hidden behind either sticky bar -- the same "reserve real
  // space for the fixed element" principle as the operator's standing
  // overlay-allotment rule, applied inside this one panel.
  useEffect(()=>{
    if(typeof ResizeObserver==="undefined")return
    const header=headerRef.current, composer=composerRef.current
    const observer=new ResizeObserver(entries=>{for(const entry of entries){const h=Math.ceil(entry.contentRect.height);if(entry.target===header)setHeaderH(h);if(entry.target===composer)setComposerH(h)}})
    if(header)observer.observe(header)
    if(composer)observer.observe(composer)
    return ()=>observer.disconnect()
  },[])
  const updateScrollShadows=useCallback(()=>{
    const el=scrollRef.current
    if(!el)return
    setAtTop(el.scrollTop<=2)
    setAtBottom(el.scrollHeight-el.scrollTop-el.clientHeight<=2)
  },[])
  useEffect(()=>{updateScrollShadows()},[updateScrollShadows,messages,pending,guidedOpen])
  // Bring the newest message (or, once there is one, the pending
  // confirmation) into view within the panel's own scroll -- never the
  // page -- honoring `scroll-padding` above so it never lands hidden
  // behind the sticky composer.
  useEffect(()=>{if(!pending)messagesRef.current?.lastElementChild?.scrollIntoView?.({block:"nearest"})},[messages,pending])
  useEffect(()=>{if(pending)pendingRef.current?.scrollIntoView?.({block:"nearest"})},[pending])
  const recognition = useRef<Recognition|null>(null)
  const parcel = useParcelContext()
  const { handoff: siteHandoff, status: siteHandoffStatus } = useSiteHandoff()
  const ruleset = getRulesetForState(parcel?.state ?? "Karnataka")
  const parcelUse = parcel && ruleset?.land_use_rules[parcel.land_use as LandUse] ? parcel.land_use as LandUse : null
  const use = (parcelUse ?? selected.use ?? "Residential") as LandUse
  const rule = ruleset?.land_use_rules[use]
  const maxFloors = Math.max(1,Math.min(8,Math.floor((rule?.max_height_m ?? 15)/3.2),Math.floor((rule?.far ?? 1.5)/Math.max((rule?.max_coverage_pct ?? 60)/100,.01))))
  const options: Record<Stage,{label:string;command:string;citation?:string}[]> = {
    use: parcel ? [] : (["Residential","Commercial","Mixed Use"] as LandUse[]).filter(item=>ruleset?.land_use_rules[item]).map(item=>({label:item,command:`set use ${item.toLowerCase()}`,citation:ruleCitation})),
    floors: Array.from({length:maxFloors},(_,index)=>({label:`${index+1} floor${index ? "s":""}`,command:`set floors ${index+1}`,citation:ruleCitation})),
    massing: ["Compact","Balanced","Slender"].map(item=>({label:item,command:`set massing ${item.toLowerCase()}`})),
    coverage: [{label:`Minimum ${rule?.min_setback_m ?? 1.5} m`,command:`set setback ${rule?.min_setback_m ?? 1.5}`,citation:ruleCitation},{label:"Add 0.5 m margin",command:`set setback ${(rule?.min_setback_m ?? 1.5)+.5}`,citation:ruleCitation},{label:`Coverage ≤ ${rule?.max_coverage_pct ?? 60}%`,command:`set coverage ${rule?.max_coverage_pct ?? 60}`,citation:ruleCitation}],
    rooms: ["Social-first","Balanced","Private-first"].map(item=>({label:item,command:`set rooms ${item.toLowerCase()}`})),
    material: ["Essential","Standard","Premium"].map(item=>({label:item,command:`set material ${item.toLowerCase()}`})),
    compliance: [{label:"Title diligence",command:"open diligence checklist",citation:ruleCitation},{label:"Permit checklist",command:"open permit checklist",citation:ruleCitation},{label:"Both",command:"open diligence and permit checklists",citation:ruleCitation}],
    output: [{label:"Measured extract",command:"show BOQ extract",citation:outputCitation},{label:"Export DXF",command:"export DXF",citation:outputCitation},{label:"Share brief",command:"share workspace brief",citation:outputCitation},{label:"Reset model",command:"reset model"}],
  }
  const answer = useCallback((command:string) => {
    // Read-only: the LandIntel site-analysis handoff informs this answer but never dispatches a command or mutates the model.
    const siteAnswer = answerSiteAnalysis(command, siteHandoff, siteHandoffStatus)
    if (siteAnswer) return siteAnswer
    const productKnowledge = answerProductKnowledge(activeProduct ? `${command} in ${productLabels[activeProduct]}` : command)
    if (productKnowledge) return { text: productKnowledge.text, citations: productKnowledge.citations?.map((citation) => citation.title) }
    const normalized=normalizeProfessionalTerms(command)
    const terms=termsIn(command)
    return /boq|extract|export/.test(normalized) ? {text:"Opening the measured workspace output. Rates remain blank until verified.",citations:[outputCitation]} : /setback|far|coverage|use|approval|noc/.test(normalized) ? {text:`I read ${terms.join(', ') || 'land-use'} terminology and constrained the next choice to the sample authority envelope.`,citations:[ruleCitation]} : /structure|mep|irr|ticket/.test(normalized) ? {text:`I read ${terms.join(', ')} terminology and routed it to the matching workspace lens; figures remain INDICATIVE.`} : {text:"Sent through the deterministic workspace command path."}
  }, [activeProduct, siteHandoff, siteHandoffStatus])
  // CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output: "Reversible
  // view-only changes may apply immediately; any project-state change must
  // be proposed and explicitly confirmed through SUTRA." A view-only
  // command (view switching, opening a panel, exporting) still dispatches
  // straight through, same as before. A project-state command (anything
  // `isProjectStateCommand` recognizes -- set/add-floor/reset) is held as
  // `pending` instead: nothing reaches `onEvent` (so nothing mutates the
  // real project) until the operator explicitly clicks Confirm below.
  const run = useCallback((raw:string,source:SutraInputSource="text",isDemo=false) => {
    const command=raw.trim()
    if(!command)return
    if(isDemo){setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"operator",text:`Demo preview: ${command}`},{id:nextId.current++,role:"sutra",...answer(command)}]);setValue("");return}
    if(parcel && /set use/i.test(command)){
      setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"operator",text:command},{id:nextId.current++,role:"sutra",text:parcelUse?`Use remains ${parcelUse}, derived from the selected parcel record. Verify competent-authority zoning before reliance.`:"Use cannot be selected manually for this parcel. Competent-authority zoning verification is required."}])
      setValue("")
      return
    }
    if(isProjectStateCommand(command)){
      setPending({command,source})
      setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"operator",text:command},{id:nextId.current++,role:"sutra",text:`Proposed change: "${command}". Confirm to apply it to the project, or cancel to discard.`}])
      setValue("")
      return
    }
    commandEvents(command,source).forEach(event=>onEvent(event))
    setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"operator",text:command},{id:nextId.current++,role:"sutra",...answer(command)}])
    setValue("")
  },[onEvent,parcel,parcelUse,answer])
  const confirmPending = useCallback(() => {
    if(!pending)return
    commandEvents(pending.command,pending.source).forEach(event=>onEvent(event))
    setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"sutra",...answer(pending.command)}])
    setPending(null)
  },[pending,onEvent,answer])
  const cancelPending = useCallback(() => {
    if(!pending)return
    setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"sutra",text:"Change discarded. Project state unchanged."}])
    setPending(null)
  },[pending])
  // "Selecting an output supplies context to SUTRA" -- a cockpit
  // direct-manipulation selection (e.g. an opening tapped on the plan)
  // reaches this panel over the same window-event bus WorkspaceCockpit
  // already uses for `ferrum:workspace-command`/`ferrum:workspace-advanced`.
  useEffect(()=>subscribeCockpitSelection(context=>{
    setSelectionContext(context)
    setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"sutra",text:`Context: ${context.label}${context.detail?` (${context.detail})`:""} selected on the cockpit.`}])
  }),[])
  useEffect(()=>{
    if(!parcelUse)return
    setSelected(current=>({...current,use:parcelUse}))
    setStage(current=>current==="use"?"floors":current)
  },[parcelUse])
  const choose = (label:string,command:string) => { const currentStage=stage; onEvent({type:"STATE_DELTA",path:"guided.selection",value:{stage:currentStage,label}}); setSelected(current=>({...current,[currentStage]:label})); const index=stages.indexOf(currentStage); if(index<stages.length-1){setHistory(current=>[...current,currentStage]);setStage(stages[index+1])}; run(command,"chip") }
  const back = () => setHistory(current=>{const prior=current[current.length-1];if(prior)setStage(prior);return current.slice(0,-1)})
  const skip = () => {const index=stages.indexOf(stage);if(index<stages.length-1){setHistory(current=>[...current,stage]);setStage(stages[index+1])}}
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");let timer:ReturnType<typeof setInterval>|undefined;let index=0;const configure=()=>{if(timer)clearInterval(timer);setDemoPaused(media.matches);if(!media.matches)timer=setInterval(()=>run(demoIntents[index++%demoIntents.length],"text",true),7000)};configure();media.addEventListener?.("change",configure);return()=>{if(timer)clearInterval(timer);media.removeEventListener?.("change",configure);recognition.current?.stop()}},[run])
  const toggleVoice=()=>{if(listening){recognition.current?.stop();setListening(false);return}const scope=window as Window&{SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};const Constructor=scope.SpeechRecognition??scope.webkitSpeechRecognition;if(!Constructor){setMessages(current=>[...current,{id:nextId.current++,role:"sutra",text:"Voice is unavailable. Chips and text remain active."}]);return}const item=new Constructor();item.continuous=false;item.interimResults=false;item.lang="en-IN";item.onresult=e=>run(e.results[0]?.[0]?.transcript??"","voice");item.onend=()=>setListening(false);item.onerror=()=>setListening(false);recognition.current=item;item.start();setListening(true)}
  // ALLOTMENT (operator standing rule, 2026-09-19): the composer is a
  // dedicated, always-visible allotment at the bottom of this panel, not a
  // floating overlay a user must discover by scrolling -- `sticky bottom-0`
  // inside the panel's own scroll container, with the header pinned the
  // same way at `sticky top-0`. Everything between them (the guided-chip
  // section, the message log, a pending confirmation) scrolls underneath
  // both bars. `scroll-padding-{top,bottom}` below, set from each sticky
  // bar's own measured height, is the allotment math that keeps a
  // scrolled-to message from landing partially hidden behind either bar --
  // the panel reserves real space for both fixed bars instead of letting
  // them cover content. This replaces the whole-panel-scrolls-as-one-blob
  // shape from the short-viewport reachability fix below: `#sutra-command`
  // is now reachable with ZERO scrolling at every viewport this row's
  // acceptance covers, because it never leaves its pinned allotment.
  return <aside ref={scrollRef} onScroll={updateScrollShadows} className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain border border-relume-border bg-relume-command text-white max-md:border-0" style={{scrollPaddingTop:headerH,scrollPaddingBottom:composerH}} aria-label="SUTRA design assistant" data-sutra-panel data-guided-stage={stage} data-demo-paused={demoPaused} data-guided-open={guidedOpen}>
    <header ref={headerRef} className={`sticky top-0 z-20 shrink-0 border-b border-white/15 bg-relume-command px-4 py-3 transition-shadow motion-reduce:transition-none md:pr-16 ${atTop?"":"shadow-[0_6px_10px_-6px_rgba(0,0,0,0.45)]"}`} data-sutra-header data-sutra-scroll-shadow={atTop?undefined:"true"}><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h1 className="font-heading text-lg font-semibold text-white">SUTRA — your digital Sthapati</h1><span className="rounded-full border border-relume-accent px-2 py-1 text-[10px] font-bold tracking-wider text-relume-accent">INDICATIVE</span></div><p className="mt-1 text-xs text-white/65">Constrained choices over the deterministic workspace.</p></header>
    <button type="button" aria-expanded={guidedOpen} aria-controls="sutra-guided" onClick={()=>setGuidedOpen(value=>!value)} className="mx-4 mt-3 min-h-11 shrink-0 rounded-full border border-white/25 px-4 text-left text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">{guidedOpen?"Describe it instead":"Can't describe it? Choose instead"}</button>
    <section id="sutra-guided" className="shrink-0 border-b border-white/15 p-4" aria-labelledby="sutra-question"><div className="flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-white/60"><span>Step {stages.indexOf(stage)+1} / {stages.length}</span><span>{Object.keys(selected).length} chosen</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-relume-accent transition-[width] motion-reduce:transition-none" style={{width:`${((stages.indexOf(stage)+1)/stages.length)*100}%`}} /></div><h2 id="sutra-question" className="mt-4 font-heading text-base font-semibold text-white">{labels[stage]}</h2><p className="mt-1 text-xs text-white/65">{stage==="use"&&parcel?(parcelUse?`Recorded use: ${parcelUse}. Competent-authority zoning verification remains required.`:"Use UNKNOWN. Competent-authority zoning verification is required before design choices."):stage==="floors"?`For ${use}, the sample envelope permits up to ${maxFloors}.`:`Choose one; the next question adapts to this state.`}</p><div className="mt-3 flex flex-wrap gap-2" data-sutra-chip-tree>{options[stage].map(option=><button key={option.label} type="button" title={option.citation} onClick={()=>choose(option.label,option.command)} className="min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold hover:border-relume-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">{option.label}</button>)}</div><div className="mt-3 flex justify-between"><button type="button" onClick={back} disabled={!history.length} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">← Back</button><button type="button" onClick={skip} disabled={stage==="output"} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">Skip →</button></div></section>
    {/* `shrink-0`: this <aside> is a flex column, so without it flexbox
        would shrink the message log down to its `min-h-24` floor whenever
        content (header+guided+composer, both now `shrink-0` too) doesn't
        fit -- the messages themselves would then overflow OUT of this
        now-too-small box and visually collide with the sticky composer
        below, instead of the panel's own `overflow-y-auto` picking up the
        extra height the way it's meant to. */}
    <div ref={messagesRef} className="min-h-24 shrink-0 space-y-3 p-4" role="log" aria-live="polite" aria-label="Conversation" tabIndex={0} data-sutra-messages data-sutra-selection-context={selectionContext?.targetId}>{messages.map(message=><article key={message.id} className={`rounded-2xl p-3 text-xs ${message.role==="operator"?"ml-5 bg-white text-relume-ink":"mr-5 border border-white/15 bg-white/5"}`}><p>{message.text}</p>{message.citations&&<ol aria-label="Citations" className="mt-2 border-t border-current/15 pt-2 text-[10px] opacity-75">{message.citations.map(citation=><li key={citation}><cite className="not-italic">[{citation}]</cite></li>)}</ol>}</article>)}</div>
    {pending && <div ref={pendingRef} className="shrink-0 border-t border-relume-accent bg-white/10 p-3" data-sutra-pending-confirm role="alert"><p className="text-xs font-semibold">Confirm project-state change?</p><p className="mt-1 text-xs text-white/75">&ldquo;{pending.command}&rdquo; will change the model until confirmed.</p><div className="mt-2 flex gap-2"><button type="button" onClick={confirmPending} className="min-h-11 rounded-full bg-relume-accent px-4 text-xs font-semibold text-relume-command">Confirm</button><button type="button" onClick={cancelPending} className="min-h-11 rounded-full border border-white/30 px-4 text-xs font-semibold">Cancel</button></div></div>}
    <form ref={composerRef} onSubmit={event=>{event.preventDefault();run(value,"text")}} className={`sticky bottom-0 z-20 shrink-0 border-t border-white/15 bg-relume-command p-3 transition-shadow motion-reduce:transition-none ${atBottom?"":"shadow-[0_-6px_10px_-6px_rgba(0,0,0,0.45)]"}`} data-sutra-composer data-sutra-scroll-shadow={atBottom?undefined:"true"}><label htmlFor="sutra-command" className="sr-only">Ask SUTRA</label><div className="flex gap-2"><input id="sutra-command" value={value} onChange={event=>setValue(event.target.value)} placeholder="Ask with a clause citation…" enterKeyHint="send" autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-white px-4 text-base text-relume-ink md:text-sm"/><button type="button" onClick={toggleVoice} aria-pressed={listening} aria-label={listening?"Stop voice input":"Start voice input"} className="min-h-11 min-w-11 rounded-full border border-white/30">◉</button><button type="submit" className="min-h-11 rounded-full bg-relume-accent px-4 text-sm font-semibold text-relume-command">Send</button></div><p className="mt-2 text-[10px] text-white/55">Idle demo cycles floor · use · setback · BOQ{demoPaused?" · paused for reduced motion":""}.</p></form>
  </aside>
}
