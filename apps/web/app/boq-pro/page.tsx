"use client"

import React, { useEffect, useMemo, useState } from "react";
import SaveToWorkspaceButton from "../../components/SaveToWorkspaceButton";
import { generateStudioPlan } from "../../lib/plan-gen";
import type { StudioParameters } from "../../lib/types";
import PlanElevationView from "../../components/workspace/PlanElevationView";
import BoqTraceabilityPanel, { type BoqTraceabilitySelection } from "../../components/workspace/BoqTraceabilityPanel";
import { readProjectState } from "../../lib/workspace/projectState";

type Material = {
  id: string;
  name: string;
  qty: number;
  rate: number;
};

const STORAGE_KEY = "boqProEstimate";
const defaultTakeoffParameters: StudioParameters = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 };

/**
 * Model-linked take-off tab: drawing/model element -> highlighted
 * measurement -> formula -> BOQ line -> revision impact, built entirely
 * on the shared StudioPlan model (same plan the Design cockpit generates)
 * and the existing measureBoq formulas. Reads the same browser-local
 * project state the cockpit writes, so opening this tab after designing
 * in the cockpit shows the same building — it does not invent a second,
 * disconnected geometry source.
 */
function ModelLinkedTakeoff() {
  const [parameters, setParameters] = useState<StudioParameters>(defaultTakeoffParameters);
  const [ready, setReady] = useState(false);
  const [activeFloor, setActiveFloor] = useState(1);
  const [selection, setSelection] = useState<BoqTraceabilitySelection>();

  useEffect(() => {
    setParameters(readProjectState(defaultTakeoffParameters).parameters);
    setReady(true);
  }, []);

  const plan = useMemo(() => generateStudioPlan(parameters), [parameters]);

  const onSelectLine = (next: BoqTraceabilitySelection) => {
    setSelection(next);
    if (next && typeof next.scope === "number") setActiveFloor(next.scope);
  };

  if (!ready) return <p className="p-4 text-sm text-relume-muted">Loading model-linked take-off…</p>;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]" data-model-linked-takeoff>
      <div className="rounded-relume border border-relume-border bg-relume-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Source drawing · floor {activeFloor}</p>
          <label className="flex items-center gap-2 text-xs font-semibold">
            Floor
            <select value={activeFloor} onChange={(event) => setActiveFloor(Number(event.target.value))} className="rounded border border-relume-border bg-white px-2 py-1">
              {Array.from({ length: plan.floors }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-2 h-80 min-h-[18rem]">
          <PlanElevationView plan={plan} view="plan" activeFloor={activeFloor} highlightedElementIds={selection?.sourceElementIds ?? []} fitAllocatedHeight />
        </div>
        <p className="mt-2 text-[10px] leading-4 text-relume-muted">Selecting a BOQ line on the right highlights the room(s)/opening(s) it was measured from, in amber. Foundation-scope lines highlight the ground-floor footprint.</p>
      </div>
      <BoqTraceabilityPanel plan={plan} onSelectLine={onSelectLine} />
    </div>
  );
}

export default function BOQProPage() {
  const [activeTab, setActiveTab] = useState<"manual" | "model-linked">("manual");
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as Material[];
    } catch (e) {
      // ignore
    }
    return [
      { id: String(Date.now()), name: "Cement (Example)", qty: 10, rate: 350 },
    ];
  });

  useEffect(() => {
    // no-op; kept for future hydration needs
  }, []);

  const updateField = (id: string, field: keyof Material, value: string | number) => {
    setMaterials((cur) =>
      cur.map((m) => (m.id === id ? { ...m, [field]: field === "name" ? String(value) : Number(value) } : m))
    );
  };

  const addRow = () =>
    setMaterials((cur) => [...cur, { id: String(Date.now() + Math.random()), name: "", qty: 0, rate: 0 }]);

  const removeRow = (id: string) => setMaterials((cur) => cur.filter((m) => m.id !== id));

  const subtotal = materials.reduce((s, m) => s + (Number(m.qty) || 0) * (Number(m.rate) || 0), 0);
  const gst = +(subtotal * 0.18);
  const grandTotal = +(subtotal + gst);

  const saveEstimate = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
      alert("Estimate saved to localStorage.");
    } catch (e) {
      alert("Failed to save estimate.");
    }
  };

  const loadEstimate = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return alert("No saved estimate found in localStorage.");
      setMaterials(JSON.parse(raw));
      alert("Estimate loaded from localStorage.");
    } catch (e) {
      alert("Failed to load estimate.");
    }
  };

  const clearEstimate = () => {
    if (!confirm("Clear the current estimate and remove saved data?")) return;
    setMaterials([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const printExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">BOQ Pro - Quantity Takeoff</h1>
      <p className="mt-2 text-sm text-relume-muted">Save/load/clear estimates locally and export a print/PDF summary (GST 18%).</p>

      <div className="mt-4 flex gap-1 border-b border-relume-border no-print" role="tablist" aria-label="BOQ Pro mode">
        <button type="button" role="tab" aria-selected={activeTab === "manual"} onClick={() => setActiveTab("manual")} className={`min-h-11 rounded-t-relume px-4 text-sm font-semibold ${activeTab === "manual" ? "border-b-2 border-relume-command text-relume-command" : "text-relume-muted hover:text-relume-command"}`}>
          Manual estimate
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "model-linked"} onClick={() => setActiveTab("model-linked")} className={`min-h-11 rounded-t-relume px-4 text-sm font-semibold ${activeTab === "model-linked" ? "border-b-2 border-relume-command text-relume-command" : "text-relume-muted hover:text-relume-command"}`}>
          Model-linked take-off
        </button>
      </div>

      {activeTab === "model-linked" && <ModelLinkedTakeoff />}

      <div className={`mt-6 ${activeTab === "model-linked" ? "hidden" : ""}`}>
        {/* W2-503: five columns (material, qty, rate, total, remove
            action) with live editable inputs don't fit a real <table>
            below `sm`. Below `sm`: one labelled card per material with
            the same inputs. At `sm`+: the original table, unchanged. */}
        <div className="space-y-3 sm:hidden">
          {materials.map((m) => (
            <div key={m.id} className="rounded border p-3">
              <label className="block text-xs font-medium text-relume-muted">
                Material
                <input
                  className="mt-1 w-full border rounded px-2 py-1"
                  value={m.name}
                  onChange={(e) => updateField(m.id, "name", e.target.value)}
                  placeholder="Material description"
                />
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block text-xs font-medium text-relume-muted">
                  Qty
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-2 py-1 text-right"
                    value={m.qty}
                    onChange={(e) => updateField(m.id, "qty", Number(e.target.value))}
                  />
                </label>
                <label className="block text-xs font-medium text-relume-muted">
                  Rate
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-2 py-1 text-right"
                    value={m.rate}
                    onChange={(e) => updateField(m.id, "rate", Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-medium text-relume-muted">Total: {((Number(m.qty) || 0) * (Number(m.rate) || 0)).toFixed(2)}</span>
                <button
                  className="text-sm text-red-600 hover:underline no-print"
                  onClick={() => removeRow(m.id)}
                  aria-label="Remove row"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {materials.length === 0 && <p className="p-4 text-center text-sm text-relume-muted">No materials. Use Add to create rows.</p>}
          <div className="rounded border p-3 text-sm">
            <div className="flex justify-between"><span className="font-semibold">Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
            <div className="mt-1 flex justify-between"><span className="font-semibold">GST (18%)</span><span>{gst.toFixed(2)}</span></div>
            <div className="mt-1 flex justify-between bg-relume-surface-secondary px-1 py-1"><span className="font-bold">Grand Total</span><span className="font-bold">{grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="hidden sm:block">
        <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-relume-surface-secondary">
                <th className="p-2 text-left">Material</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={m.name}
                      onChange={(e) => updateField(m.id, "name", e.target.value)}
                      placeholder="Material description"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-right"
                      value={m.qty}
                      onChange={(e) => updateField(m.id, "qty", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-right"
                      value={m.rate}
                      onChange={(e) => updateField(m.id, "rate", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2 text-right">{((Number(m.qty) || 0) * (Number(m.rate) || 0)).toFixed(2)}</td>
                  <td className="p-2 text-center no-print">
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => removeRow(m.id)}
                      aria-label="Remove row"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td className="p-4 text-center" colSpan={5}>
                    No materials. Use Add to create rows.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="p-2 text-right font-semibold">Subtotal</td>
                <td className="p-2 text-right">{subtotal.toFixed(2)}</td>
                <td className="no-print" />
              </tr>
              <tr>
                <td colSpan={3} className="p-2 text-right font-semibold">GST (18%)</td>
                <td className="p-2 text-right">{gst.toFixed(2)}</td>
                <td className="no-print" />
              </tr>
              <tr className="bg-relume-surface-secondary">
                <td colSpan={3} className="p-2 text-right font-bold">Grand Total</td>
                <td className="p-2 text-right font-bold">{grandTotal.toFixed(2)}</td>
                <td className="no-print" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap no-print">
          <button className="px-4 py-2 bg-relume-ink text-white rounded" onClick={addRow}>
            Add Material
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={saveEstimate}>
            Save Estimate
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={loadEstimate}>
            Load Estimate
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded" onClick={clearEstimate}>
            Clear Estimate
          </button>
          <button className="px-4 py-2 bg-relume-ink text-white rounded" onClick={printExport}>
            Print / Export PDF
          </button>
          <SaveToWorkspaceButton
            type="boq"
            title={`BOQ — ${materials.length} item(s), ₹${grandTotal.toLocaleString("en-IN")}`}
            data={{ materials, subtotal, gst, grand_total: grandTotal }}
          />
        </div>

        <div className="mt-6 print-summary">
          <h2 className="text-lg font-semibold">Summary (print view)</h2>
          <div className="mt-2">
            <div>Subtotal: {subtotal.toFixed(2)}</div>
            <div>GST (18%): {gst.toFixed(2)}</div>
            <div className="font-bold">Grand Total: {grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <style>{`
        /* Hide interactive controls when printing */
        @media print {
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
