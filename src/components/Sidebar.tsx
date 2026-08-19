import { Bookmark, Crosshair, Fuel, Gauge, LogOut, Navigation, Route, Save } from 'lucide-react'
import type { MultiStopPlan } from '../types/api'
import type { UserProfile } from '../types/auth'
import {
  currencySymbol,
  formatDistanceKm,
  formatDuration,
  formatPlanTotalCost,
  getStopCurrencyCode,
} from '../utils/routeAdvice'

type PickMode = 'origin' | 'destination' | null

const FUEL_TYPES = ['BIO_DIESEL', 'DIESEL', 'DIESEL_PLUS', 'E100', 'E80', 'E85', 'FUEL_TYPE_UNSPECIFIED', 'LPG', 'METHANE', 'MIDGRADE', 'PREMIUM', 'REGULAR_UNLEADED', 'SP100', 'SP91', 'SP91_E10', 'SP92', 'SP95', 'SP95_E10', 'SP98', 'SP99', 'TRUCK_DIESEL']

interface SidebarProps {
  user: UserProfile
  onLogout: () => void

  tankOverride: string
  fuelEfficiencyOverride: string
  currentFuel: string
  onTankOverrideChange: (value: string) => void
  onFuelEfficiencyOverrideChange: (value: string) => void
  onCurrentFuelChange: (value: string) => void
  onSaveProfileOverrides: () => void
  profileSaved: boolean
  profileSaving: boolean
  profileError: string | null

  fuelType: string
  onFuelTypeChange: (value: string) => void

  segmentDistanceMeters: string
  onSegmentDistanceMetersChange: (value: string) => void
  locationBiasRadiusMeters: string
  onLocationBiasRadiusMetersChange: (value: string) => void

  originLat: string
  originLng: string
  destLat: string
  destLng: string
  onOriginLatChange: (value: string) => void
  onOriginLngChange: (value: string) => void
  onDestLatChange: (value: string) => void
  onDestLngChange: (value: string) => void
  originValid: boolean
  destinationValid: boolean
  currentFuelValid: boolean
  pickMode: PickMode
  onTogglePickMode: (mode: 'origin' | 'destination') => void
  onCalculateRoute: () => void
  routeLoading: boolean
  routeError: string | null

  multiStopPlans: MultiStopPlan[]
  selectedPlanIndex: number | null
  onSelectPlan: (index: number | null) => void

  routeName: string
  onRouteNameChange: (value: string) => void
  onSaveRoute: () => void
  saveRouteLoading: boolean
  saveRouteError: string | null
  saveRouteSuccess: boolean
}

export function Sidebar({
  user,
  onLogout,
  tankOverride,
  fuelEfficiencyOverride,
  currentFuel,
  onTankOverrideChange,
  onFuelEfficiencyOverrideChange,
  onCurrentFuelChange,
  onSaveProfileOverrides,
  profileSaved,
  profileSaving,
  profileError,
  fuelType,
  onFuelTypeChange,
  // Temporarily hidden: Segment Spacing / Search Radius overrides (see JSX below)
  // segmentDistanceMeters,
  // onSegmentDistanceMetersChange,
  // locationBiasRadiusMeters,
  // onLocationBiasRadiusMetersChange,
  originLat,
  originLng,
  destLat,
  destLng,
  onOriginLatChange,
  onOriginLngChange,
  onDestLatChange,
  onDestLngChange,
  originValid,
  destinationValid,
  currentFuelValid,
  pickMode,
  onTogglePickMode,
  onCalculateRoute,
  routeLoading,
  routeError,
  multiStopPlans,
  selectedPlanIndex,
  onSelectPlan,
  routeName,
  onRouteNameChange,
  onSaveRoute,
  saveRouteLoading,
  saveRouteError,
  saveRouteSuccess,
}: SidebarProps) {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">FuelWise</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        >
          <LogOut size={18} />
        </button>
      </div>

      <section className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Gauge size={16} /> Profile Quick Settings
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tank Capacity (L)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={tankOverride}
              onChange={(e) => onTankOverrideChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Efficiency (L/100km)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={fuelEfficiencyOverride}
              onChange={(e) => onFuelEfficiencyOverrideChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Fuel (L) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={currentFuel}
              onChange={(e) => onCurrentFuelChange(e.target.value)}
              placeholder="e.g. 15.0"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onSaveProfileOverrides}
          disabled={profileSaving}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
        >
          <Save size={14} /> {profileSaving ? 'Saving...' : 'Save to profile'}
        </button>
        {profileSaved && <p className="mt-1 text-xs text-emerald-600">Profile updated.</p>}
        {profileError && <p className="mt-1 text-xs text-red-600">{profileError}</p>}
      </section>

      <section className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Route size={16} /> Route Planner
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => onFuelTypeChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            >
              {FUEL_TYPES.map((type) => (
                <option key={type} value={type} className="bg-white dark:bg-slate-900">
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Origin</label>
              <button
                type="button"
                onClick={() => onTogglePickMode('origin')}
                className={`flex items-center gap-1 text-xs font-medium ${pickMode === 'origin' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'
                  }`}
              >
                <Crosshair size={12} /> Pick on map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lat"
                value={originLat}
                onChange={(e) => onOriginLatChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lng"
                value={originLng}
                onChange={(e) => onOriginLngChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Destination</label>
              <button
                type="button"
                onClick={() => onTogglePickMode('destination')}
                className={`flex items-center gap-1 text-xs font-medium ${pickMode === 'destination' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'
                  }`}
              >
                <Crosshair size={12} /> Pick on map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lat"
                value={destLat}
                onChange={(e) => onDestLatChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lng"
                value={destLng}
                onChange={(e) => onDestLngChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          {/* Temporarily hidden: Segment Spacing / Search Radius overrides
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Segment Spacing (m)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                placeholder="20000"
                value={segmentDistanceMeters}
                onChange={(e) => onSegmentDistanceMetersChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Search Radius (m)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                placeholder="5000"
                value={locationBiasRadiusMeters}
                onChange={(e) => onLocationBiasRadiusMetersChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          */}
          <button
            type="button"
            onClick={onCalculateRoute}
            disabled={routeLoading || !originValid || !destinationValid || !currentFuelValid}
            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white text-sm font-medium py-2 transition-colors"
          >
            <Navigation size={15} /> {routeLoading ? 'Calculating…' : 'Calculate Fuel-Wise Route'}
          </button>
          {routeError && <p className="text-xs text-red-600">{routeError}</p>}
        </div>
      </section>

      <section className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Fuel size={16} /> Fuel-Wise Route Plans ({multiStopPlans.length})
          </h2>
        </div>
        {multiStopPlans.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Route name (e.g. Commute)"
              value={routeName}
              onChange={(e) => onRouteNameChange(e.target.value)}
              className="flex-1 min-w-0 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={onSaveRoute}
              disabled={saveRouteLoading || selectedPlanIndex == null || routeName.trim() === ''}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              <Bookmark size={14} /> {saveRouteLoading ? 'Saving...' : 'Save this trip'}
            </button>
          </div>
        )}
        {saveRouteSuccess && <p className="mb-2 text-xs text-emerald-600">Route saved.</p>}
        {saveRouteError && <p className="mb-2 text-xs text-red-600">{saveRouteError}</p>}
        {multiStopPlans.length > 0 && selectedPlanIndex == null && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Select a plan below to save it.</p>
        )}
        {multiStopPlans.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate a route to see refuel plans for trips that need more than one tank.
          </p>
        )}
        <div className="space-y-3">
          {multiStopPlans.map((plan, index) => {
            return (
              <div key={index}>
                <button
                  type="button"
                  onClick={() => onSelectPlan(index === selectedPlanIndex ? null : index)}
                  className={`w-full text-left rounded-md bg-emerald-50 dark:bg-emerald-900/20 border px-3 py-3 transition-colors ${index === selectedPlanIndex
                    ? 'border-emerald-500 ring-1 ring-emerald-500'
                    : 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                    }`}
                >
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Plan {index + 1} · {plan.stops.length === 0 ? 'No refuel needed' : `${plan.stops.length} stop${plan.stops.length > 1 ? 's' : ''}`}
                  </p>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 space-y-0.5 mb-2">
                    <p>Total cost: {formatPlanTotalCost(plan)}</p>
                    <p>Added time: {formatDuration(plan.totalAddedSeconds)}</p>
                    <p>Added distance: {formatDistanceKm(plan.totalAddedMeters)}</p>
                  </div>
                  {plan.stops.length > 0 && (
                    <ol className="space-y-1.5 mb-2">
                      {plan.stops.map((stop, stopIndex) => (
                        <li key={stopIndex} className="text-xs text-emerald-800/90 dark:text-emerald-300/90 border-t border-emerald-200 dark:border-emerald-800 pt-1.5">
                          <p className="font-medium">
                            {stopIndex + 1}. {stop.station.displayName.text}
                          </p>
                          <p className="text-emerald-700/70 dark:text-emerald-400/70">{stop.station.formattedAddress}</p>
                          <p>
                            {currencySymbol(getStopCurrencyCode(stop))}{stop.pricePerLiter.toFixed(3)}/L · {stop.litersPurchased.toFixed(1)} L ·
                            {' '}{currencySymbol(getStopCurrencyCode(stop))}{stop.stopCost.toFixed(2)}
                          </p>
                          <p>At {formatDistanceKm(stop.positionMeters)} · +{formatDistanceKm(stop.addedMeters)} / +{formatDuration(stop.addedSeconds)} detour</p>
                        </li>
                      ))}
                    </ol>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Route size={12} /> {index === selectedPlanIndex ? 'Route shown on map' : 'Show route on map'}
                  </span>
                </button>
                {plan.directionsUri && (
                  <a
                    href={plan.directionsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Navigation size={12} /> Navigate in Google Maps
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
