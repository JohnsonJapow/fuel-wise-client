import type { LatLng, RouteAdviceOption } from '../types/api'

/**
 * Prefer the station's own Places API location; fall back to the leg
 * boundary (leg 0 end / leg 1 start) for any response shape that omits it.
 */
export function getStationCoordinate(option: RouteAdviceOption): LatLng | null {
  const location = option.station.location
  if (location) return { lat: location.latitude, lng: location.longitude }

  const legs = option.routingSummary.legs
  const loc = legs[0]?.endLocation ?? legs[1]?.startLocation ?? legs[0]?.startLocation
  if (!loc) return null
  return { lat: loc.latLng.latitude, lng: loc.latLng.longitude }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function formatDistanceKm(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`
}
