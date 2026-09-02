"use client"

import { useEffect, useMemo, useState } from "react"

type User = { id: string; email: string } | null
type Artifact = { id: string; artifact_id?: string; type: string; title?: string; input?: Record<string, string | number | boolean | null> }
type Project = { id: string; name: string; city: string; ulpin?: string | null; artifacts?: Artifact[] }
type Activity = { id?: string; message?: string; type?: string; project_name?: string; created_at?: string }
type State = "loading" | "ready" | "unavailable"

const stages = [
  ["Land", "/products/landintel", "TEST MODE", ["land", "ulpin", "parcel"]], ["Design", "/products/designstudio", "TEST MODE", ["design", "plan"]],
  ["Structure", "/products/structura", "TEST MODE", ["struct", "is-code"]], ["Cost", "/products/boq-pro", "TEST MODE", ["boq", "cost", "estimate"]],
  ["Procure", "/products/procurehub", "ROADMAP", ["procure", "vendor"]], ["Build", "/products/buildos", "ROADMAP", ["build", "site"]],
  ["Invest", "/products/investflow", "ROADMAP", ["invest", "irr", "npv"]], ["Transact", "/products/transact", "ROADMAP", ["transact", "title"]],
] as const

function list<T>(value: unknown, key: string): T[] { return Array.isArray(value) ? value as T[] : Array.isArray((value as Record<string, unknown>)?.[key]) ? (value as Record<string, T[]>)[key] : [] }
function href(stage: typeof stages[number], project?: Project, artifact?: Artifact) {
  const query = new URLSearchParams(); if (project) query.set("project_id", project.id); if (artifact) query.set("artifact_id", artifact.artifact_id || artifact.id)
  if (project?.ulpin && stage[0] === "Land") query.set("ulpin", project.ulpin)
  Object.entries(artifact?.input || {}).forEach(([key, value]) => value !== null && query.set(key, String(value)))
  return query.size ? `${stage[1]}?${query}` : stage[1]
}

export default function CommandDeck() {
  const [user, setUser] = useState<User>(null), [auth, setAuth] = useState<State>("loading"), [state, setState] = useState<State>("loading")
  const [projects, setProjects] = useState<Project[]>([]), [activity, setActivity] = useState<Activity[]>([]), [projectId, setProjectId] = useState(""), [palette, setPalette] = useState(false), [query, setQuery] = useState("")
  useEffect(() => { fetch("/api/auth/session").then(r => r.ok ? r.json() : { user: null }).then(d => setUser(d.user || null)).catch(() => setUser(null)).finally(() => setAuth("ready")) }, [])
  useEffect(() => {
    if (!user) return
    Promise.all([fetch("/api/projects"), fetch("/api/activity")]).then(async ([projectResponse, activityResponse]) => {
      if (!projectResponse.ok || !activityResponse.ok) throw Error()
      const summaries = list<Project>(await projectResponse.json(), "projects")
      const details = await Promise.all(summaries.map(async project => { const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`); return response.ok ? { ...project, ...await response.json() } : project }))
      setProjects(details); setProjectId(details[0]?.id || ""); setActivity(list<Activity>(await activityResponse.json(), "activity")); setState("ready")
    }).catch(() => setState("unavailable"))
  }, [user])
  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette(true) }; if (event.key === "Escape") setPalette(false) }; addEventListener("keydown", key); return () => removeEventListener("keydown", key) }, [])
  const project = projects.find(item => item.id === projectId), filtered = useMemo(() => stages.filter(stage => stage[0].toLowerCase().includes(query.toLowerCase())), [query])
  const artifact = (stage: typeof stages[number]) => project?.artifacts?.find(item => stage[3].some(term => item.type.toLowerCase().includes(term)))
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login" }
  if (auth === "loading") return <main className="min-h-screen bg-relume-surface-secondary p-12 text-center text-relume-muted">Loading Command Deck…</main>
  if (!user) return <main className="min-h-screen bg-relume-surface-secondary p-12 text-center"><p className="text-relume-muted">Sign in to open your Command Deck.</p><a className="mt-4 inline-block rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white" href="/login">Sign in</a></main>
  return <main className="min-h-screen bg-relume-surface-secondary px-4 py-10 sm:px-6"><div className="mx-auto max-w-relume-container">
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-relume-border pb-8"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-relume-tight text-relume-ink">Command Deck</h1><p className="mt-2 text-sm text-relume-muted">Project spine, actual attached artifacts, and recent work.</p></div><div className="flex gap-2"><button onClick={() => setPalette(true)} className="rounded-full border border-relume-border bg-relume-surface px-4 py-2 text-sm">Command <kbd className="text-relume-muted">Ctrl K</kbd></button><button onClick={logout} className="rounded-full border border-relume-border px-4 py-2 text-sm text-relume-muted">Sign out</button></div></header>
    <section className="py-relume-section"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Project context</p><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold tracking-relume-tight text-relume-ink">{project?.name || "No project selected"}</h2>{projects.length > 1 && <select className="rounded-relume border border-relume-border bg-relume-surface p-2 text-sm" value={projectId} onChange={e => setProjectId(e.target.value)}>{projects.map(item => <option value={item.id} key={item.id}>{item.name} · {item.city}</option>)}</select>}</div>{state === "unavailable" && <p className="mt-5 rounded-relume border border-relume-border bg-relume-surface p-4 text-sm text-relume-muted">Command Deck data is not available yet. No sample projects are shown.</p>}{state === "ready" && !projects.length && <p className="mt-5 rounded-relume border border-relume-border bg-relume-surface p-4 text-sm text-relume-muted">No projects yet. Create one when the documented API is available.</p>}</section>
    <section className="border-y border-relume-border py-relume-section"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Pipeline</p><h2 className="mt-2 text-xl font-semibold tracking-relume-tight text-relume-ink">Resume from the last attached output</h2><ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stages.map((stage, index) => { const latest = artifact(stage); return <li className="rounded-relume border border-relume-border bg-relume-surface p-5" key={stage[0]}><div className="flex justify-between"><span className="text-xs text-relume-muted">0{index + 1}</span><span className="rounded-full border border-relume-border px-2 py-1 text-[10px] text-relume-muted">{stage[2]}</span></div><h3 className="mt-5 font-semibold text-relume-ink">{stage[0]}</h3><p className="mt-1 truncate text-xs text-relume-muted">{latest?.title || latest?.type || "No attached output yet."}</p><a className="mt-5 inline-block text-sm font-medium text-relume-ink underline underline-offset-4" href={href(stage, project, latest)}>{latest ? "Resume" : "Open engine"}</a></li> })}</ol></section>
    <section className="grid gap-6 py-relume-section lg:grid-cols-2"><div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Artifacts</p><h2 className="mt-2 text-xl font-semibold tracking-relume-tight">Attached to this project</h2>{project?.artifacts?.length ? <ul className="mt-5 divide-y divide-relume-border">{project.artifacts.map(item => <li className="py-3" key={item.id}><p className="font-medium">{item.title || item.type}</p><p className="text-xs text-relume-muted">{item.type}</p></li>)}</ul> : <p className="mt-5 text-sm text-relume-muted">No artifacts attached yet.</p>}</div><div className="rounded-relume border border-relume-border bg-relume-surface p-relume-card"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Activity ledger</p><h2 className="mt-2 text-xl font-semibold tracking-relume-tight">Recent work</h2>{activity.length ? <ul className="mt-5 space-y-4">{activity.slice(0, 6).map((item, index) => <li className="border-l border-relume-border pl-3 text-sm" key={item.id || index}>{item.message || item.type || "Project activity"}<span className="mt-1 block text-xs text-relume-muted">{item.project_name || "Workspace"}{item.created_at ? ` · ${item.created_at}` : ""}</span></li>)}</ul> : <p className="mt-5 text-sm text-relume-muted">No activity available yet.</p>}</div></section>
  </div>{palette && <div className="fixed inset-0 z-50 grid place-items-start bg-black/20 px-4 pt-24" role="dialog" aria-modal="true"><div className="w-full max-w-xl rounded-relume border border-relume-border bg-relume-surface p-4"><input autoFocus className="w-full rounded-relume border border-relume-border p-3" placeholder="Search engines…" value={query} onChange={e => setQuery(e.target.value)} />{filtered.map(stage => <a className="mt-2 flex justify-between rounded-relume p-3 text-sm hover:bg-relume-surface-secondary" href={href(stage, project, artifact(stage))} key={stage[0]}><span>{stage[0]}</span><span className="text-relume-muted">{stage[2]}</span></a>)}<button className="mt-3 text-sm text-relume-muted underline" onClick={() => setPalette(false)}>Close</button></div></div>}</main>
}
