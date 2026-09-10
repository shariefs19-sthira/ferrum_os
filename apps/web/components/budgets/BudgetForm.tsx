"use client"
import { useMemo, useState } from "react"

export default function BudgetForm({ onChange }: { onChange?: (value: { maxBudget: number; allocatedBudget: number; remainingBudget: number; currency: "INR" }) => void }) {
  const [maxBudget, setMaxBudget] = useState(0); const [allocatedBudget, setAllocatedBudget] = useState(0)
  const invalid = allocatedBudget > maxBudget; const remainingBudget = Math.max(0, maxBudget - allocatedBudget)
  const update = (max: number, allocated: number) => { setMaxBudget(max); setAllocatedBudget(allocated); onChange?.({ maxBudget: max, allocatedBudget: allocated, remainingBudget: Math.max(0, max - allocated), currency: "INR" }) }
  const percent = useMemo(() => maxBudget ? allocatedBudget / maxBudget * 100 : 0, [maxBudget, allocatedBudget])
  return <fieldset className="rounded-relume border border-relume-border bg-relume-surface p-4"><legend className="font-heading font-semibold">Budget allocation</legend><p className="mt-1 text-sm text-relume-muted">INR · warning at 80% · critical at 95%</p><label className="mt-4 block text-sm font-medium">Maximum budget<input type="number" min="0" value={maxBudget} onChange={e => update(Number(e.target.value), allocatedBudget)} className="mt-1 block w-full rounded-relume border border-relume-border p-2" /></label><label className="mt-3 block text-sm font-medium">Allocated budget<input type="number" min="0" max={maxBudget} value={allocatedBudget} onChange={e => update(maxBudget, Number(e.target.value))} aria-invalid={invalid} className="mt-1 block w-full rounded-relume border border-relume-border p-2" /></label>{invalid && <p role="alert" className="mt-2 text-sm text-red-700">Allocated budget cannot exceed maximum budget.</p>}<p className="mt-3 text-sm">Remaining: ₹{remainingBudget.toLocaleString("en-IN")} ({percent.toFixed(1)}% allocated)</p></fieldset>
}
