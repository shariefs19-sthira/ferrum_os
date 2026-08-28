"use client"

import React, { useEffect, useState } from "react";

type Material = {
  id: string;
  name: string;
  qty: number;
  rate: number;
};

const STORAGE_KEY = "boqProEstimate";

export default function BOQProPage() {
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
      <p className="mt-2 text-sm text-gray-600">Save/load/clear estimates locally and export a print/PDF summary (GST 18%).</p>

      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
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
              <tr className="bg-gray-50">
                <td colSpan={3} className="p-2 text-right font-bold">Grand Total</td>
                <td className="p-2 text-right font-bold">{grandTotal.toFixed(2)}</td>
                <td className="no-print" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap no-print">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={addRow}>
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
          <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={printExport}>
            Print / Export PDF
          </button>
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
