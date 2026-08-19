import { useState } from 'react'
import { Bookmark, ExternalLink, Fuel, MapPin, RefreshCw, Trash2 } from 'lucide-react'
import type { RecalculateSavedRouteResponse, SavedRoute } from '../types/api'
import { NO_PLAN_REASON_MESSAGES, formatDistanceKm, formatDuration, formatPlanTotalCost } from '../utils/routeAdvice'

interface SavedTripsProps {
  savedRoutes: SavedRoute[]
  loading: boolean
  error: string | null
  activeRouteId: string | null
  onRefresh: () => void
  onSelectRoute: (route: SavedRoute) => void
  onDeleteRoute: (id: string) => void
  recalcResults: Record<string, RecalculateSavedRouteResponse>
  recalcLoadingIds: Record<string, boolean>
  recalcErrors: Record<string, string | null>
  onRecalculateRoute: (route: SavedRoute, currentFuelLiters: number) => void
}

export function SavedTrips({
  savedRoutes,
  loading,
  error,
  activeRouteId,
  onRefresh,
  onSelectRoute,
  onDeleteRoute,
  recalcResults,
  recalcLoadingIds,
  recalcErrors,
  onRecalculateRoute,
}: SavedTripsProps) {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Bookmark size={16} /> Saved Trips ({savedRoutes.length})
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh saved trips"
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-5 py-4">
        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
        {loading && savedRoutes.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading saved trips…</p>
        )}
        {!loading && savedRoutes.length === 0 && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No saved trips yet. Calculate a route and use "Save this trip" to keep it here.
          </p>
        )}
        <div className="space-y-3">
          {savedRoutes.map((route) => (
            <SavedTripCard
              key={route.id}
              route={route}
              isActive={route.id === activeRouteId}
              onSelectRoute={onSelectRoute}
              onDeleteRoute={onDeleteRoute}
              recalcResult={recalcResults[route.id]}
              recalcLoading={recalcLoadingIds[route.id] ?? false}
              recalcError={recalcErrors[route.id] ?? null}
              onRecalculateRoute={onRecalculateRoute}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SavedTripCardProps {
  route: SavedRoute
  isActive: boolean
  onSelectRoute: (route: SavedRoute) => void
  onDeleteRoute: (id: string) => void
  recalcResult: RecalculateSavedRouteResponse | undefined
  recalcLoading: boolean
  recalcError: string | null
  onRecalculateRoute: (route: SavedRoute, currentFuelLiters: number) => void
}

function SavedTripCard({
  route,
  isActive,
  onSelectRoute,
  onDeleteRoute,
  recalcResult,
  recalcLoading,
  recalcError,
  onRecalculateRoute,
}: SavedTripCardProps) {
  const [currentFuelLiters, setCurrentFuelLiters] = useState('')
  const plan = route.plan
  const parsedFuel = Number(currentFuelLiters)
  const fuelValid = currentFuelLiters.trim() !== '' && Number.isFinite(parsedFuel) && parsedFuel >= 0

  return (
    <div
      className={`rounded-md border px-3 py-3 transition-colors ${
        isActive
          ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onSelectRoute(route)} className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {route.routeName || 'Untitled trip'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {route.fuelType} · {new Date(route.createdAt).toLocaleDateString()}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onDeleteRoute(route.id)}
          title="Delete saved trip"
          className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {plan && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
          <p>Total cost: {formatPlanTotalCost(plan)}</p>
          <p>Added time: {formatDuration(plan.totalAddedSeconds)}</p>
          <p>Added distance: {formatDistanceKm(plan.totalAddedMeters)}</p>
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectRoute(route)}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
        >
          <MapPin size={12} /> {isActive ? 'Shown on map' : 'Show on map'}
        </button>
        {plan?.directionsUri && (
          <a
            href={plan.directionsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink size={12} /> Open in Google Maps
          </a>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">Check current price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.1"
            value={currentFuelLiters}
            onChange={(e) => setCurrentFuelLiters(e.target.value)}
            placeholder="Current fuel (L)"
            className="w-32 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => onRecalculateRoute(route, parsedFuel)}
            disabled={!fuelValid || recalcLoading}
            className="inline-flex items-center gap-1 rounded-md bg-slate-800 dark:bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            <Fuel size={12} className={recalcLoading ? 'animate-pulse' : ''} />
            {recalcLoading ? 'Checking…' : 'Recalculate'}
          </button>
        </div>
        {recalcError && <p className="mt-1.5 text-xs text-red-600">{recalcError}</p>}
        {recalcResult && !recalcError && (
          <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            <p>
              {recalcResult.totalCost != null
                ? `Latest check: ${recalcResult.totalCost.toFixed(2)}`
                : (recalcResult.noPlanReason && NO_PLAN_REASON_MESSAGES[recalcResult.noPlanReason]) ||
                  'No viable plan found.'}
              {' · '}
              {new Date(recalcResult.checkedAt).toLocaleString()}
            </p>
            {recalcResult.plans && recalcResult.plans.length > 0 && (
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
                Sent to Route Planner — pick a plan there to view or save it.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
