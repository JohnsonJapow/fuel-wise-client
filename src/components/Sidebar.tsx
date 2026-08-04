import { Crosshair, Gauge, LogOut, MapPin, Navigation, Route, Save } from 'lucide-react'
import type { RouteAdviceOption } from '../types/api'
import type { UserProfile } from '../types/auth'
import { formatDistanceKm, formatDuration } from '../utils/routeAdvice'

type PickMode = 'origin' | 'destination' | null

const FUEL_TYPES = ['SP91', 'SP91_E10', 'SP92', 'SP95_E10', 'SP98', 'SP99', 'SP100', 'DIESEL', 'TRUCK_DIESEL', 'BIODIESEL', 'REGULAR_UNLEADED', 'MIDGRADE', 'PREMIUM', 'LPG', 'E80', 'E85', 'METHANE']

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

  adviceOptions: RouteAdviceOption[]
  cheapestAdviceIndex: number | null
  selectedAdviceIndex: number | null
  onSelectAdvice: (index: number | null) => void
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
  adviceOptions,
  cheapestAdviceIndex,
  selectedAdviceIndex,
  onSelectAdvice,
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
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <MapPin size={16} /> Gas Stations ({adviceOptions.length})
        </h2>
        {adviceOptions.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate a route to see fuel-wise station options.
          </p>
        )}
        <ul className="space-y-2">
          {adviceOptions.map((option, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelectAdvice(index === selectedAdviceIndex ? null : index)}
                className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${index === selectedAdviceIndex
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white">{option.station.displayName.text}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{option.station.formattedAddress}</p>
                <span
                  className={
                    index === cheapestAdviceIndex
                      ? 'text-xs font-semibold text-emerald-600 dark:text-emerald-400'
                      : 'text-xs text-slate-700 dark:text-slate-300'
                  }
                >
                  €{option.fuelPricePerLiter.toFixed(3)} / L
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Route size={16} /> Route Advice
        </h2>
        {adviceOptions.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The best money-saving detours will appear here after you calculate a route.
          </p>
        )}
        <div className="space-y-3">
          {adviceOptions.map((option, index) => (
            <button
              type="button"
              key={index}
              onClick={() => onSelectAdvice(index === selectedAdviceIndex ? null : index)}
              className={`w-full text-left rounded-md bg-emerald-50 dark:bg-emerald-900/20 border px-3 py-3 transition-colors ${index === selectedAdviceIndex
                ? 'border-emerald-500 ring-1 ring-emerald-500'
                : 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                }`}
            >
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {option.station.displayName.text}
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-2">
                {option.station.formattedAddress} · €{option.fuelPricePerLiter.toFixed(3)}/L
              </p>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 space-y-0.5 mb-2">
                <p>Total trip cost: €{option.totalCostOffset.toFixed(2)}</p>
                <p>Added time: {formatDuration(option.addedSeconds)}</p>
                <p>Added distance: {formatDistanceKm(option.addedMeters)}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Route size={12} /> {index === selectedAdviceIndex ? 'Route shown on map' : 'Show route on map'}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
