"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"

type ParcelMapProps = {
  /** Approximate parcel center; sample/indicative unless a real ULPIN geometry is wired later. */
  lat?: number
  lng?: number
  label?: string
  zoom?: number
}

/**
 * Parity: Leaflet + OpenStreetMap parcel map — W2-309. Uses `leaflet`
 * directly (BSD-2-Clause), not `react-leaflet` (Hippocratic-2.1,
 * license-restricted, avoided deliberately). OSM tile data is
 * © OpenStreetMap contributors under ODbL — attribution is required
 * and shown in the map's built-in attribution control, not removed.
 */
export default function ParcelMap({ lat = 12.9716, lng = 77.5946, label = "Sample parcel", zoom = 15 }: ParcelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current).setView([lat, lng], zoom)
      mapRef.current = map

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Bundlers break Leaflet's default marker icon path resolution;
      // point it at the CDN-hosted images explicitly (standard fix).
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(label)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [lat, lng, label, zoom])

  return (
    <div className="overflow-hidden rounded-lg border border-relume-border">
      <div
        ref={containerRef}
        className="h-80 w-full"
        role="img"
        aria-label={`Map showing ${label}`}
        data-map-lat={lat}
        data-map-lng={lng}
      />
    </div>
  )
}
