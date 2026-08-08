import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, MapIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { MapView } from '../components/MapView'
import { Sidebar } from '../components/Sidebar'
import { ApiError, fetchMultiStopRouteAdvice } from '../services/api'
import type { LatLng, MultiStopPlan } from '../types/api'

const DEFAULT_CENTER: LatLng = { lat: 52.52, lng: 13.405 }
const MAX_ADVICE_OPTIONS = 3

function parseCoord(value: string): number | null {
  if (value.trim() === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export function Dashboard() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [tankOverride, setTankOverride] = useState(String(user?.tankCapacity ?? ''))
  const [fuelEfficiencyOverride, setFuelEfficiencyOverride] = useState(String(user?.fuelEfficiency ?? ''))
  const [currentFuel, setCurrentFuel] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setTankOverride(String(user.tankCapacity))
    setFuelEfficiencyOverride(String(user.fuelEfficiency))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resync overrides only when switching users, not on every profile edit
  }, [user?.id])

  const [fuelType, setFuelType] = useState('REGULAR_UNLEADED')

  const [segmentDistanceMeters, setSegmentDistanceMeters] = useState('')
  const [locationBiasRadiusMeters, setLocationBiasRadiusMeters] = useState('')

  const [originLat, setOriginLat] = useState('')
  const [originLng, setOriginLng] = useState('')
  const [destLat, setDestLat] = useState('')
  const [destLng, setDestLng] = useState('')
  const [pickMode, setPickMode] = useState<'origin' | 'destination' | null>(null)

  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  const [multiStopPlans, setMultiStopPlans] = useState<MultiStopPlan[]>([])
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null)

  const [mobileView, setMobileView] = useState<'sidebar' | 'map'>('sidebar')

  const origin: LatLng | null = useMemo(() => {
    const lat = parseCoord(originLat)
    const lng = parseCoord(originLng)
    return lat != null && lng != null ? { lat, lng } : null
  }, [originLat, originLng])

  const destination: LatLng | null = useMemo(() => {
    const lat = parseCoord(destLat)
    const lng = parseCoord(destLng)
    return lat != null && lng != null ? { lat, lng } : null
  }, [destLat, destLng])

  const currentFuelValid = useMemo(() => parseCoord(currentFuel) != null, [currentFuel])

  function handleMapClick(loc: LatLng) {
    if (pickMode === 'origin') {
      setOriginLat(loc.lat.toFixed(6))
      setOriginLng(loc.lng.toFixed(6))
      setPickMode(null)
      return
    }
    if (pickMode === 'destination') {
      setDestLat(loc.lat.toFixed(6))
      setDestLng(loc.lng.toFixed(6))
      setPickMode(null)
    }
  }

  async function handleSaveProfileOverrides() {
    if (!user) return
    const tankCapacity = Number(tankOverride)
    const fuelEfficiency = Number(fuelEfficiencyOverride)
    if (!Number.isFinite(tankCapacity) || tankCapacity <= 0 || !Number.isFinite(fuelEfficiency) || fuelEfficiency <= 0) {
      setProfileError('Tank capacity and fuel efficiency must be positive numbers.')
      return
    }
    setProfileSaving(true)
    setProfileError(null)
    try {
      await updateProfile({ vehicleType: user.vehicleType, fuelEfficiency, tankCapacity })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true, state: { sessionExpired: true } })
        return
      }
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleCalculateRoute() {
    if (!origin || !destination || !currentFuelValid) return
    setRouteLoading(true)
    setRouteError(null)
    const tankCapacityLiters = tankOverride.trim() !== '' ? Number(tankOverride) : undefined
    const fuelEfficiencyL100km = fuelEfficiencyOverride.trim() !== '' ? Number(fuelEfficiencyOverride) : undefined
    const fuelEfficiencyKml = fuelEfficiencyL100km != null ? 100 / fuelEfficiencyL100km : undefined
    const currentFuelLiters = currentFuel.trim() !== '' ? Number(currentFuel) : undefined
    try {
      const segmentDistance = segmentDistanceMeters.trim() !== '' ? Number(segmentDistanceMeters) : undefined
      const locationBiasRadius = locationBiasRadiusMeters.trim() !== '' ? Number(locationBiasRadiusMeters) : undefined
      const result = await fetchMultiStopRouteAdvice({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        fuelType,
        tankCapacityLiters,
        currentFuelLiters,
        fuelEfficiencyKml,
        segmentDistanceMeters: segmentDistance,
        locationBiasRadiusMeters: locationBiasRadius,
      })
      const sorted = [...result].sort((a, b) => a.totalCost - b.totalCost).slice(0, MAX_ADVICE_OPTIONS)
      setMultiStopPlans(sorted)
      setSelectedPlanIndex(sorted.length > 0 ? 0 : null)
      if (sorted.length === 0) {
        setRouteError('No route found for the given origin and destination.')
      } else {
        setMobileView('map')
      }

      // Deprecated: single-stop /routes/advice is superseded by fetchMultiStopRouteAdvice (see 3.5 in claude.md).
      // const result = await fetchRouteAdvice({
      //   originLat: origin.lat,
      //   originLng: origin.lng,
      //   destLat: destination.lat,
      //   destLng: destination.lng,
      //   fuelType,
      //   tankCapacityLiters,
      //   currentFuelLiters,
      //   fuelEfficiencyKml,
      // })
      // const sorted = [...result].sort((a, b) => a.totalCostOffset - b.totalCostOffset).slice(0, MAX_ADVICE_OPTIONS)
      // setAdviceOptions(sorted)
      // setSelectedAdviceIndex(sorted.length > 0 ? 0 : null)
      // if (sorted.length === 0) {
      //   setRouteError('No route found for the given origin and destination.')
      // } else {
      //   setMobileView('map')
      // }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true, state: { sessionExpired: true } })
        return
      }
      setRouteError(err instanceof Error ? err.message : 'Failed to calculate route')
    } finally {
      setRouteLoading(false)
    }
  }

  function handleSelectPlan(index: number | null) {
    setSelectedPlanIndex(index)
    if (index != null) setMobileView('map')
  }

  if (!user) return null

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setMobileView('sidebar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${
            mobileView === 'sidebar'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <List size={16} /> Controls
        </button>
        <button
          type="button"
          onClick={() => setMobileView('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${
            mobileView === 'map' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MapIcon size={16} /> Map
        </button>
      </div>

      <div className={`w-full md:w-[35%] md:min-w-90 h-full ${mobileView === 'sidebar' ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          user={user}
          onLogout={logout}
          tankOverride={tankOverride}
          fuelEfficiencyOverride={fuelEfficiencyOverride}
          currentFuel={currentFuel}
          onTankOverrideChange={setTankOverride}
          onFuelEfficiencyOverrideChange={setFuelEfficiencyOverride}
          onCurrentFuelChange={setCurrentFuel}
          onSaveProfileOverrides={handleSaveProfileOverrides}
          profileSaved={profileSaved}
          profileSaving={profileSaving}
          profileError={profileError}
          fuelType={fuelType}
          onFuelTypeChange={setFuelType}
          segmentDistanceMeters={segmentDistanceMeters}
          onSegmentDistanceMetersChange={setSegmentDistanceMeters}
          locationBiasRadiusMeters={locationBiasRadiusMeters}
          onLocationBiasRadiusMetersChange={setLocationBiasRadiusMeters}
          originLat={originLat}
          originLng={originLng}
          destLat={destLat}
          destLng={destLng}
          onOriginLatChange={setOriginLat}
          onOriginLngChange={setOriginLng}
          onDestLatChange={setDestLat}
          onDestLngChange={setDestLng}
          originValid={origin != null}
          destinationValid={destination != null}
          currentFuelValid={currentFuelValid}
          pickMode={pickMode}
          onTogglePickMode={(mode) => {
            setPickMode((prev) => (prev === mode ? null : mode))
            setMobileView('map')
          }}
          onCalculateRoute={handleCalculateRoute}
          routeLoading={routeLoading}
          routeError={routeError}
          multiStopPlans={multiStopPlans}
          selectedPlanIndex={selectedPlanIndex}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      <div className={`w-full md:w-[65%] h-full ${mobileView === 'map' ? 'block' : 'hidden'} md:block`}>
        <MapView
          center={origin ?? DEFAULT_CENTER}
          origin={origin}
          destination={destination}
          pickMode={pickMode}
          onMapClick={handleMapClick}
          multiStopPlans={multiStopPlans}
          selectedPlanIndex={selectedPlanIndex}
        />
      </div>
    </div>
  )
}
