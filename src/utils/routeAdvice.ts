import type { LatLng, MultiStopPlan, MultiStopStop, RouteAdviceOption } from '../types/api'

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

/** Multi-stop stations always carry a Places `location`, unlike the single-stop advice shape. */
export function getMultiStopCoordinate(stop: MultiStopStop): LatLng | null {
  const location = stop.station.location
  if (!location) return null
  return { lat: location.latitude, lng: location.longitude }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export function currencySymbol(code: string | undefined): string {
  if (!code) return ''
  return CURRENCY_SYMBOLS[code] ?? `${code} `
}

export function getStopCurrencyCode(stop: MultiStopStop | undefined): string | undefined {
  return stop?.station.fuelOptions.fuelPrices.find((p) => p.price)?.price?.currencyCode
}

/**
 * Stops in a plan can be priced in different currencies (e.g. crossing a border).
 * We never convert between currencies, so a plan spanning more than one currency
 * is shown as separate per-currency sums (e.g. "€800.00 + 2,000.00 CZK") rather
 * than a single misleading total.
 */
export function formatPlanTotalCost(plan: MultiStopPlan): string {
  if (plan.stops.length === 0) return plan.totalCost.toFixed(2)

  const sumsByCurrency = new Map<string, number>()
  for (const stop of plan.stops) {
    const code = getStopCurrencyCode(stop) ?? ''
    sumsByCurrency.set(code, (sumsByCurrency.get(code) ?? 0) + stop.stopCost)
  }

  return Array.from(sumsByCurrency.entries())
    .map(([code, sum]) => `${currencySymbol(code)}${sum.toFixed(2)}`)
    .join(' + ')
}
