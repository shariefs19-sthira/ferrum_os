"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getRulesetForState } from "../../lib/parcelIntel/sampleRulesets"
import type { LandUse } from "../../lib/parcelIntel/types"
import { normalizeProfessionalTerms, termsIn } from "../../lib/workspace/vocabulary"

type Stage = "use" | "floors" | "massing" | "coverage" | "rooms" | "material" | "compliance" | "output"
type Message = { id: number; role: "operator" | "sutra"; text: string; citations?: string[] }
type Recognition = { continuous:boolean; interimResults:boolean; lang:string; start:()=>void; stop:()=>void; onresult:((e:{results:ArrayLike<{0:{transcript:string}}>})=>void)|null; onend:(()=>void)|null; onerror:(()=>void)|null }
type RecognitionConstructor = new()=>Recognition

const stages: Stage[] = ["use","floors","massing","coverage","rooms","material","compliance","output"]
const labels: Record<Stage,string> = { use:"Use", floors:"Floors", massing:"Massing style", coverage:"Setback / coverage", rooms:"Rooms split", material:"Material grade", compliance:"Diligence / permits", output:"Extract / export / share" }
const demoIntents = ["add one floor","set use residential","set setback 3","show BOQ extract"]
const ruleCitation = "Karnataka 2026.1-SAMPLE · INDICATIVE land-use structure; verify competent-authority records."
const outputCitation = "Workspace export contract · DXF live; IFC queued; local save only."

export default function SutraPanel({ onSubmit }: { onSubmit:(text:string)=>void }) {
  const [stage,setStage] = useState<Stage>("use")
  const [history,setHistory] = useState<Stage[]>([])
  const [selected,setSelected] = useState<Partial<Record<Stage,string>>>({})
  const [value,setValue] = useState("")
  const [listening,setListening] = useState(false)
  const [demoPaused,setDemoPaused] = useState(true)
  const [messages,setMessages] = useState<Message[]>([{id:0,role:"sutra",text:"Shape the brief one constrained decision at a time. No typing required."}])
  const nextId = useRef(1)
  const recognition = useRef<Recognition|null>(null)
  const ruleset = getRulesetForState("Karnataka")
  const use = (selected.use ?? "Residential") as LandUse
  const rule = ruleset?.land_use_rules[use]
  const maxFloors = Math.max(1,Math.min(8,Math.floor((rule?.max_height_m ?? 15)/3.2),Math.floor((rule?.far ?? 1.5)/Math.max((rule?.max_coverage_pct ?? 60)/100,.01))))
  const options: Record<Stage,{label:string;command:string;citation?:string}[]> = {
    use: (["Residential","Commercial","Mixed Use"] as LandUse[]).filter(item=>ruleset?.land_use_rules[item]).map(item=>({label:item,command:`set use ${item.toLowerCase()}`,citation:ruleCitation})),
    floors: Array.from({length:maxFloors},(_,index)=>({label:`${index+1} floor${index ? "s":""}`,command:`set floors ${index+1}`,citation:ruleCitation})),
    massing: ["Compact","Balanced","Slender"].map(item=>({label:item,command:`set massing ${item.toLowerCase()}`})),
    coverage: [{label:`Minimum ${rule?.min_setback_m ?? 1.5} m`,command:`set setback ${rule?.min_setback_m ?? 1.5}`,citation:ruleCitation},{label:"Add 0.5 m margin",command:`set setback ${(rule?.min_setback_m ?? 1.5)+.5}`,citation:ruleCitation},{label:`Coverage ≤ ${rule?.max_coverage_pct ?? 60}%`,command:`set coverage ${rule?.max_coverage_pct ?? 60}`,citation:ruleCitation}],
    rooms: ["Social-first","Balanced","Private-first"].map(item=>({label:item,command:`set rooms ${item.toLowerCase()}`})),
    material: ["Essential","Standard","Premium"].map(item=>({label:item,command:`set material ${item.toLowerCase()}`})),
    compliance: [{label:"Title diligence",command:"open diligence checklist",citation:ruleCitation},{label:"Permit checklist",command:"open permit checklist",citation:ruleCitation},{label:"Both",command:"open diligence and permit checklists",citation:ruleCitation}],
    output: [{label:"Measured extract",command:"show BOQ extract",citation:outputCitation},{label:"Export DXF",command:"export DXF",citation:outputCitation},{label:"Share brief",command:"share workspace brief",citation:outputCitation}],
  }
  const answer = (command:string) => { const normalized=normalizeProfessionalTerms(command); const terms=termsIn(command); return /boq|extract|export/.test(normalized) ? {text:"Opening the measured workspace output. Rates remain blank until verified.",citations:[outputCitation]} : /setback|far|coverage|use|approval|noc/.test(normalized) ? {text:`I read ${terms.join(', ') || 'land-use'} terminology and constrained the next choice to the sample authority envelope.`,citations:[ruleCitation]} : /structure|mep|irr|ticket/.test(normalized) ? {text:`I read ${terms.join(', ')} terminology and routed it to the matching workspace lens; figures remain INDICATIVE.`} : {text:"Sent through the deterministic workspace command path."} }
  const run = useCallback((raw:string,isDemo=false) => { const command=raw.trim(); if(!command)return; onSubmit(command); setMessages(current=>[...current.slice(-5),{id:nextId.current++,role:"operator",text:isDemo?`Demo: ${command}`:command},{id:nextId.current++,role:"sutra",...answer(command)}]); setValue("") },[onSubmit])
  const choose = (label:string,command:string) => { run(command); setSelected(current=>({...current,[stage]:label})); const index=stages.indexOf(stage); if(index<stages.length-1){setHistory(current=>[...current,stage]);setStage(stages[index+1])} }
  const back = () => setHistory(current=>{const prior=current[current.length-1];if(prior)setStage(prior);return current.slice(0,-1)})
  const skip = () => {const index=stages.indexOf(stage);if(index<stages.length-1){setHistory(current=>[...current,stage]);setStage(stages[index+1])}}
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");let timer:ReturnType<typeof setInterval>|undefined;let index=0;const configure=()=>{if(timer)clearInterval(timer);setDemoPaused(media.matches);if(!media.matches)timer=setInterval(()=>run(demoIntents[index++%demoIntents.length],true),7000)};configure();media.addEventListener?.("change",configure);return()=>{if(timer)clearInterval(timer);media.removeEventListener?.("change",configure);recognition.current?.stop()}},[run])
  const toggleVoice=()=>{if(listening){recognition.current?.stop();setListening(false);return}const scope=window as Window&{SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};const Constructor=scope.SpeechRecognition??scope.webkitSpeechRecognition;if(!Constructor){setMessages(current=>[...current,{id:nextId.current++,role:"sutra",text:"Voice is unavailable. Chips and text remain active."}]);return}const item=new Constructor();item.continuous=false;item.interimResults=false;item.lang="en-IN";item.onresult=e=>run(e.results[0]?.[0]?.transcript??"");item.onend=()=>setListening(false);item.onerror=()=>setListening(false);recognition.current=item;item.start();setListening(true)}
  return <aside className="flex min-h-[22rem] flex-col border border-relume-border bg-relume-command text-white lg:h-full" aria-label="SUTRA design assistant" data-sutra-panel data-guided-stage={stage} data-demo-paused={demoPaused}>
    <header className="border-b border-white/15 px-4 py-3 pr-16"><div className="flex items-center gap-3"><h1 className="font-heading text-lg font-semibold">SUTRA — your digital Sthapati</h1><span className="rounded-full border border-relume-accent px-2 py-1 text-[10px] font-bold tracking-wider text-relume-accent">INDICATIVE</span></div><p className="mt-1 text-xs text-white/65">Constrained choices over the deterministic workspace.</p></header>
    <section className="border-b border-white/15 p-4" aria-labelledby="sutra-question"><div className="flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-white/60"><span>Step {stages.indexOf(stage)+1} / {stages.length}</span><span>{Object.keys(selected).length} chosen</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-relume-accent transition-[width] motion-reduce:transition-none" style={{width:`${((stages.indexOf(stage)+1)/stages.length)*100}%`}} /></div><h2 id="sutra-question" className="mt-4 font-heading text-base font-semibold">{labels[stage]}</h2><p className="mt-1 text-xs text-white/65">{stage==="floors"?`For ${use}, the sample envelope permits up to ${maxFloors}.`:`Choose one; the next question adapts to this state.`}</p><div className="mt-3 flex flex-wrap gap-2" data-sutra-chip-tree>{options[stage].map(option=><button key={option.label} type="button" title={option.citation} onClick={()=>choose(option.label,option.command)} className="min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold hover:border-relume-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">{option.label}</button>)}</div><div className="mt-3 flex justify-between"><button type="button" onClick={back} disabled={!history.length} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">← Back</button><button type="button" onClick={skip} disabled={stage==="output"} className="min-h-11 px-2 text-xs font-semibold disabled:opacity-35">Skip →</button></div></section>
    <div className="min-h-24 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.slice(-3).map(message=><article key={message.id} className={`rounded-2xl p-3 text-xs ${message.role==="operator"?"ml-5 bg-white text-relume-ink":"mr-5 border border-white/15 bg-white/5"}`}><p>{message.text}</p>{message.citations&&<ol aria-label="Citations" className="mt-2 border-t border-current/15 pt-2 text-[10px] opacity-75">{message.citations.map(citation=><li key={citation}><cite className="not-italic">[{citation}]</cite></li>)}</ol>}</article>)}</div>
    <form onSubmit={event=>{event.preventDefault();run(value)}} className="border-t border-white/15 p-3"><label htmlFor="sutra-command" className="sr-only">Ask SUTRA</label><div className="flex gap-2"><input id="sutra-command" value={value} onChange={event=>setValue(event.target.value)} placeholder="Ask with a clause citation…" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-white px-4 text-sm text-relume-ink"/><button type="button" onClick={toggleVoice} aria-pressed={listening} aria-label={listening?"Stop voice input":"Start voice input"} className="min-h-11 min-w-11 rounded-full border border-white/30">◉</button><button type="submit" className="min-h-11 rounded-full bg-relume-accent px-4 text-sm font-semibold text-relume-command">Send</button></div><p className="mt-2 text-[10px] text-white/55">Idle demo cycles floor · use · setback · BOQ{demoPaused?" · paused for reduced motion":""}.</p></form>
  </aside>
}
