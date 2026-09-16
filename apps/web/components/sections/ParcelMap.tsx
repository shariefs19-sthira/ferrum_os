"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap, Marker } from "leaflet"
import "leaflet/dist/leaflet.css"

type ParcelMapProps = {
  /** Approximate parcel center; sample/indicative unless a real ULPIN geometry is wired later. */
  lat?: number
  lng?: number
  label?: string
  zoom?: number
  onPinDrop?: (coordinates: { lat: number; lng: number }) => void
  className?: string
}

/**
 * Parity: Leaflet + OpenStreetMap parcel map — W2-309. Uses `leaflet`
 * directly (BSD-2-Clause), not `react-leaflet` (Hippocratic-2.1,
 * license-restricted, avoided deliberately). OSM tile data is
 * © OpenStreetMap contributors under ODbL — attribution is required
 * and shown in the map's built-in attribution control, not removed.
 */
export default function ParcelMap({ lat = 12.9716, lng = 77.5946, label = "Sample location", zoom = 12, onPinDrop, className = "h-full min-h-[38rem]" }: ParcelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const latestDrop = useRef(onPinDrop)
  const initialised = useRef(false)
  latestDrop.current = onPinDrop

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

      markerRef.current = L.marker([lat, lng], { icon }).addTo(map).bindPopup(label)
      map.on('click', (event) => latestDrop.current?.({ lat: event.latlng.lat, lng: event.latlng.lng }))
      initialised.current = true
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !initialised.current) return
    markerRef.current.setLatLng([lat, lng]).bindPopup(label)
    mapRef.current.panTo([lat, lng], { animate: false })
  }, [lat, lng, label])

  return (
    <div className={`overflow-hidden rounded-lg border border-relume-border ${className}`} data-parcel-map-shell>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label={`Map showing ${label}`}
        data-map-lat={lat}
        data-map-lng={lng}
        data-map-canvas
      />
    </div>
  )
}
