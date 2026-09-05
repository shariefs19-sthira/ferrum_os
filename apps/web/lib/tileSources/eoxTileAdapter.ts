import type { FootprintCollection, TileSourceAdapter } from "./types"

// EOX (Sentinel-2 cloudless / s2maps.eu) tile adapter - FLAGGED per the
// operator-directed tile-source due diligence, not wired to a live
// fetch. Recent vintages (2018-2024) ship under CC BY-NC-SA 4.0
// (non-commercial only); commercial use requires EOX's own
// "Commercial Attribution-RestrictedUse 1.1" license (paid) -
// permitted for use in a product/service under that license, but
// non-transferable to end users under the same license. No such
// license has been purchased, so this adapter is a schema/contract
// stub only (REQUIRES_PAID_LICENSE) - fetchFootprints always returns
// null, never a fabricated or "just try it and see" fetch against a
// license the operator hasn't actually bought.
export function createEoxTileAdapter(): TileSourceAdapter {
  return {
    id: "eox-sentinel2-cloudless",
    provenance: {
      sourceName: "EOX Sentinel-2 cloudless (s2maps.eu)",
      termsUrl: "https://s2maps.eu/",
      checkedAt: "2026-09-05",
      status: "REQUIRES_PAID_LICENSE",
      attributionText:
        "Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data <year>)",
      note: "Non-commercial-only under CC BY-NC-SA 4.0 for recent vintages; commercial use requires EOX's paid Commercial Attribution-RestrictedUse 1.1 license, not currently held. No live fetch is wired - build the concept/contract now, per operator directive, and make it live once the operator purchases the license.",
    },
    async fetchFootprints(): Promise<FootprintCollection | null> {
      return null
    },
  }
}
