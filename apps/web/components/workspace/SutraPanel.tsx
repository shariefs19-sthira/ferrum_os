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
  const messagesRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{const region=messagesRef.current;if(region)region.scrollTop=region.scrollHeight},[messages])
  // On phones the panel scrolls as a whole; bring a new confirmation into view so Confirm/Cancel are never below the fold.
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
  // The aside itself is the scroll container at EVERY width, not just below
  // `md`. Desktop-docked SUTRA has no `min-h` floor forcing it below its
  // allocated region height (that only produced overflow at short desktop
  // viewports, e.g. 1024x700 with the cookie bar showing): header + the
  // guided section + the min-height message log + the composer add up to
  // more vertical space than a short viewport's docked region has, and
  // without `overflow-y-auto` here that excess was silently clipped by the
  // ancestor `overflow-hidden` on `[data-sutra-region]` -- pushing
  // `#sutra-command` below the visible, unreachable-by-scroll area instead
  // of leaving it reachable via a scroll inside the panel.
  return <aside className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain border border-relume-border bg-relume-command text-white max-md:border-0" aria-label="SUTRA design assistant" data-sutra-panel data-guided-stage={stage} data-demo-paused={demoPaused} data-guided-open={guidedOpen}>
    <header className="shrink-0 border-b border-white/15 px-4 py-3 md:pr-16"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h1 className="font-heading text-lg font-semibold text-white">SUTRA — your digital Sthapati</h1><span className="rounded-full border border-relume-accent px-2 py-1 text-[10px] font-bold tracking-wider text-relume-accent">INDICATIVE</span></div><p className="mt-1 text-xs text-white/65">Constrained choices over the deterministic workspace.</p></header>
    <button type="button" aria-expanded={guidedOpen} aria-controls="sutra-guided" onClick={()=>setGuidedOpen(value=>!value)} className="mx-4 mt-3 min-h-11 shrink-0 rounded-full border border-white/25 px-4 text-left text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">{guidedOpen?"Describe it instead":"Can't describe it? Choose instead"}</button>
    <section id="sutra-guided" className="shrink-0 border-b border-white/15 p-4" aria-labelledby="sutra-question"><div className="flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-white/60"><span>Step {stages.indexOf(stage)+1} / {stages.length}</span><span>{Object.keys(selected).length} chosen</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-relume-accent transition-[width] motion-reduce:transition-none" style={{width:`${((stages.indexOf(stage)+1)/stages.length)*100}%`}} /></div><h2 id="sutra-question" className="mt-4 font-heading text-base font-semibold text-white">{labels[stage]}</h2><p className="mt-1 text-xs text-white/65">{stage==="use"&&parcel?(parcelUse?`Recorded use: ${parcelUse}. Competent-authority zoning verification remains required.`:"Use UNKNOWN. Competent-authority zoning verification is required before design choices."):stage==="floors"?`For ${use}, the sample envelope permits up to ${maxFloors}.`:`Choose one; the next question adapts to this state.`}</p><div className="mt-3 flex flex-wrap gap-2" data-sutra-chip-tree>{options[stage].map(option=><button key={option.label} type="button" title={option.citation} onClick={()=>choose(option.label,option.command)} className="min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold hover:border-relume-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">{option.label}</button>)}</div><div className="mt-3 flex justify-between"><button type="button" onClick={back} disabled={!history.length} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">← Back</button><button type="button" onClick={skip} disabled={stage==="output"} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">Skip →</button></div></section>
    <div ref={messagesRef} className="min-h-24 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 max-md:min-h-[8rem]" role="log" aria-live="polite" aria-label="Conversation" tabIndex={0} data-sutra-messages data-sutra-selection-context={selectionContext?.targetId}>{messages.map(message=><article key={message.id} className={`rounded-2xl p-3 text-xs ${message.role==="operator"?"ml-5 bg-white text-relume-ink":"mr-5 border border-white/15 bg-white/5"}`}><p>{message.text}</p>{message.citations&&<ol aria-label="Citations" className="mt-2 border-t border-current/15 pt-2 text-[10px] opacity-75">{message.citations.map(citation=><li key={citation}><cite className="not-italic">[{citation}]</cite></li>)}</ol>}</article>)}</div>
    {pending && <div ref={pendingRef} className="shrink-0 border-t border-relume-accent bg-white/10 p-3" data-sutra-pending-confirm role="alert"><p className="text-xs font-semibold">Confirm project-state change?</p><p className="mt-1 text-xs text-white/75">&ldquo;{pending.command}&rdquo; will change the model until confirmed.</p><div className="mt-2 flex gap-2"><button type="button" onClick={confirmPending} className="min-h-11 rounded-full bg-relume-accent px-4 text-xs font-semibold text-relume-command">Confirm</button><button type="button" onClick={cancelPending} className="min-h-11 rounded-full border border-white/30 px-4 text-xs font-semibold">Cancel</button></div></div>}
    <form onSubmit={event=>{event.preventDefault();run(value,"text")}} className="shrink-0 border-t border-white/15 p-3"><label htmlFor="sutra-command" className="sr-only">Ask SUTRA</label><div className="flex gap-2"><input id="sutra-command" value={value} onChange={event=>setValue(event.target.value)} placeholder="Ask with a clause citation…" enterKeyHint="send" autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-white px-4 text-base text-relume-ink md:text-sm"/><button type="button" onClick={toggleVoice} aria-pressed={listening} aria-label={listening?"Stop voice input":"Start voice input"} className="min-h-11 min-w-11 rounded-full border border-white/30">◉</button><button type="submit" className="min-h-11 rounded-full bg-relume-accent px-4 text-sm font-semibold text-relume-command">Send</button></div><p className="mt-2 text-[10px] text-white/55">Idle demo cycles floor · use · setback · BOQ{demoPaused?" · paused for reduced motion":""}.</p></form>
  </aside>
}
