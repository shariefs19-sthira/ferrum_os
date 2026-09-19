/**
 * Deterministic sun geometry for a map point. This is astronomy, not a site
 * measurement: it uses the mean obliquity and the standard sunrise-azimuth
 * relation cos(A) = sin(declination) / cos(latitude). Atmospheric refraction,
 * horizon dip, terrain and neighbouring buildings are NOT modelled, so a real
 * site's first and last direct sun differ. Accuracy is stated in
 * `solarGeometryNote`; a shadow study still needs surveyed heights.
 */

export const OBLIQUITY_DEG = 23.4393

export type SunEvent = {
  id: 'march-equinox' | 'june-solstice' | 'september-equinox' | 'december-solstice'
  label: string
  declinationDeg: number
  /** Clockwise from true north; null when the sun does not rise/set that day (polar). */
  sunriseAzimuthDeg: number | null
  sunsetAzimuthDeg: number | null
  noonAltitudeDeg: number
  noonBearing: 'N' | 'S' | 'ZENITH'
}

export const solarGeometryNote = 'COMPUTED from the map point with mean obliquity. Not a site measurement: refraction, horizon dip, terrain and neighbouring buildings are not modelled (azimuths are approximate to about 1 degree at best).'

const RAD = Math.PI / 180

function eventFor(id: SunEvent['id'], label: string, declinationDeg: number, latitudeDeg: number): SunEvent {
  const ratio = Math.sin(declinationDeg * RAD) / Math.cos(latitudeDeg * RAD)
  const rises = Number.isFinite(ratio) && Math.abs(ratio) <= 1
  const sunrise = rises ? Math.acos(ratio) / RAD : null
  const altitude = 90 - Math.abs(latitudeDeg - declinationDeg)
  const noonBearing = Math.abs(latitudeDeg - declinationDeg) < 0.01 ? 'ZENITH' : declinationDeg > latitudeDeg ? 'N' : 'S'
  return {
    id,
    label,
    declinationDeg,
    sunriseAzimuthDeg: sunrise,
    sunsetAzimuthDeg: sunrise === null ? null : 360 - sunrise,
    noonAltitudeDeg: altitude,
    noonBearing,
  }
}

export function computeSunGeometry(latitudeDeg: number): SunEvent[] | null {
  if (!Number.isFinite(latitudeDeg) || latitudeDeg < -90 || latitudeDeg > 90) return null
  return [
    eventFor('march-equinox', 'March equinox', 0, latitudeDeg),
    eventFor('june-solstice', 'June solstice', OBLIQUITY_DEG, latitudeDeg),
    eventFor('september-equinox', 'September equinox', 0, latitudeDeg),
    eventFor('december-solstice', 'December solstice', -OBLIQUITY_DEG, latitudeDeg),
  ]
}

/** Compass label for a bearing, used so an arrow is never the only carrier of meaning. */
export function compassLabel(bearingDeg: number): string {
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return points[Math.round((((bearingDeg % 360) + 360) % 360) / 22.5) % 16]
}
