"use client"

import { useEffect, useState } from "react"
import ParcelMap from "./ParcelMap"
import SaveToWorkspaceButton from "../SaveToWorkspaceButton"
import { ProvenanceStrip } from "../ProvenanceStrip"

// Rough India bounding box, used only to place an unlabeled preview pin
// before any lookup — never presented as a parcel or a real location.
const INDIA_BOUNDS = { latMin: 8, latMax: 35, lngMin: 68, lngMax: 97 }

function randomIndiaPoint() {
  return {
    lat: INDIA_BOUNDS.latMin + Math.random() * (INDIA_BOUNDS.latMax - INDIA_BOUNDS.latMin),
    lng: INDIA_BOUNDS.lngMin + Math.random() * (INDIA_BOUNDS.lngMax - INDIA_BOUNDS.lngMin),
  }
}

type PlotIntel = {
  ruleset: { version: string; source_note: string } | null
}

type ParcelResult = {
  ulpin: string
  state: string
  district: string
  area_sqm: number
  land_use: string
  indicative: boolean
  plot_intel?: PlotIntel | null
}

const SAMPLE_ULPINS = ["KA-BLR-0001-2024", "MH-PUN-0002-2024", "TN-CHN-0003-2024"]

// City reference centres for orienting the three seeded records — never
// presented as parcel coordinates or boundaries. OpenStreetMap references:
// Bengaluru: https://wiki.openstreetmap.org/wiki/Bengaluru
// Pune: https://www.openstreetmap.org/?mlat=18.5208&mlon=73.8551&zoom=11
// Chennai: https://wiki.openstreetmap.org/wiki/Chennai
const SAMPLE_MAPS: Record<string, { lat: number; lng: number; city: string }> = {
  "KA-BLR-0001-2024": { lat: 12.9767936, lng: 77.590082, city: "Bengaluru" },
  "MH-PUN-0002-2024": { lat: 18.5208, lng: 73.8551, city: "Pune" },
  "TN-CHN-0003-2024": { lat: 13.09, lng: 80.27, city: "Chennai" },
}

/** One D1-backed ULPIN lookup surface with a synchronized city-reference map. */
export default function UlpinMapExplorer() {
  const [ulpin, setUlpin] = useState("")
  const [result, setResult] = useState<ParcelResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewCenter, setPreviewCenter] = useState<{ lat: number; lng: number } | null>(null)
  const selectedMap = SAMPLE_MAPS[ulpin]

  // Randomized client-side, after mount — this static-exported page has no
  // per-request server, so a random value picked during the build would be
  // baked into every visitor's HTML and never actually vary "per load".
  useEffect(() => {
    setPreviewCenter(randomIndiaPoint())
  }, [])

  const selectSample = (sample: string) => {
    setUlpin(sample)
    setResult(null)
    setError("")
  }

  const handleLookup = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const response = await fetch(`/api/ulpin/${encodeURIComponent(ulpin)}`)
      if (!response.ok) {
        setError("No sample parcel found for that ULPIN. Try one of the sample IDs above.")
        return
      }
      setResult(await response.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
        <div className="flex flex-wrap gap-2">
          {SAMPLE_ULPINS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => selectSample(sample)}
              aria-pressed={ulpin === sample}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${ulpin === sample ? "border-relume-ink bg-relume-ink text-white" : "border-relume-border text-relume-ink"}`}
            >
              {sample}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="ulpin-map-input">Sample ULPIN</label>
          <input
            id="ulpin-map-input"
            value={ulpin}
            onChange={(event) => {
              setUlpin(event.target.value)
              setResult(null)
            }}
            className="min-w-0 flex-1 rounded-lg border border-relume-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading}
            className="rounded-full bg-relume-ink px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Lookup"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-relume-ink sm:grid-cols-4 lg:grid-cols-2">
            <p><strong>State:</strong> {result.state}</p>
            <p><strong>District:</strong> {result.district}</p>
            <p><strong>Area:</strong> {result.area_sqm} m²</p>
            <p><strong>Land use:</strong> {result.land_use}</p>
          </div>
        )}
        {result?.plot_intel?.ruleset && (
          <div className="mt-3">
            <ProvenanceStrip
              source={result.plot_intel.ruleset.source_note}
              freshness={result.plot_intel.ruleset.version}
            />
          </div>
        )}
        {result && (
          <div className="mt-4">
            <SaveToWorkspaceButton type="ulpin_lookup" title={`ULPIN — ${result.ulpin}`} data={result} />
          </div>
        )}
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
          Indicative sample data
        </p>
      </div>

      {selectedMap ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-relume-ink">{selectedMap.city} reference centre</p>
            <span className="rounded-full border border-relume-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
              Indicative map
            </span>
          </div>
          <ParcelMap
            lat={selectedMap.lat}
            lng={selectedMap.lng}
            zoom={11}
            label={`${ulpin} — ${selectedMap.city} city reference centre, not parcel geometry`}
          />
          <p className="mt-3 text-[11px] leading-5 text-relume-muted">
            City orientation only. The sample data contains no parcel coordinates or boundary geometry.
          </p>
        </div>
      ) : ulpin === "" ? (
        previewCenter ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-relume-ink">Preview — random location. Run a lookup to jump to a parcel.</p>
              <span className="rounded-full border border-relume-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">
                Preview
              </span>
            </div>
            <ParcelMap
              lat={previewCenter.lat}
              lng={previewCenter.lng}
              zoom={4}
              label="Preview — random location within India, not a parcel or lookup result"
            />
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-relume-border p-6 text-center" />
        )
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-relume-border p-6 text-center">
          <p className="max-w-sm text-sm leading-6 text-relume-muted">
            Map unavailable for custom IDs. Select one of the three mapped sample records.
          </p>
        </div>
      )}
    </div>
  )
}
