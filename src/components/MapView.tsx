import { useCallback, useEffect, useState } from 'react'
import { DirectionsRenderer, GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { LatLng, MultiStopPlan } from '../types/api'
import { currencySymbol, getMultiStopCoordinate, getStopCurrencyCode } from '../utils/routeAdvice'

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' }

const DEFAULT_CENTER: LatLng = { lat: 52.52, lng: 13.405 }

const ORIGIN_ICON = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
const DEST_ICON = 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
const STATION_ICON = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'

type PickMode = 'origin' | 'destination' | null

interface MapViewProps {
  center: LatLng
  origin: LatLng | null
  destination: LatLng | null
  pickMode: PickMode
  onMapClick: (loc: LatLng) => void
  multiStopPlans: MultiStopPlan[]
  selectedPlanIndex: number | null
}

function MapMessage({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'error' }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-center px-6">
      <p className={`text-sm ${tone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
        {children}
      </p>
    </div>
  )
}

function LoadedMapView({ apiKey, ...props }: MapViewProps & { apiKey: string }) {
  const {
    center,
    origin,
    destination,
    pickMode,
    onMapClick,
    multiStopPlans,
    selectedPlanIndex,
  } = props
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fuelwise-google-map',
    googleMapsApiKey: apiKey,
  })

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    },
    [onMapClick],
  )

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [directionsError, setDirectionsError] = useState<string | null>(null)
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null)

  useEffect(() => {
    setSelectedStopIndex(null)
  }, [selectedPlanIndex])

  const selectedPlanForRoute = selectedPlanIndex != null ? multiStopPlans[selectedPlanIndex] : null

  useEffect(() => {
    if (!isLoaded || !origin || !destination || !selectedPlanForRoute) {
      setDirections(null)
      setDirectionsError(null)
      return
    }

    const waypoints: google.maps.DirectionsWaypoint[] = selectedPlanForRoute.stops
      .map((stop) => getMultiStopCoordinate(stop))
      .filter((loc): loc is LatLng => loc != null)
      .map((location) => ({ location, stopover: true }))

    let cancelled = false
    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (cancelled) return
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
          setDirectionsError(null)
        } else {
          console.error('Directions request failed:', status)
          setDirections(null)
          setDirectionsError(
            status === google.maps.DirectionsStatus.REQUEST_DENIED
              ? 'Directions API is not enabled for this key (enable it in Google Cloud Console).'
              : `Could not load route (${status}).`,
          )
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [isLoaded, selectedPlanForRoute, origin, destination])

  if (loadError) {
    return <MapMessage tone="error">Failed to load Google Maps. Check your API key and network.</MapMessage>
  }

  if (!isLoaded) {
    return <MapMessage>Loading map…</MapMessage>
  }

  const selectedStop =
    selectedPlanForRoute && selectedStopIndex != null ? selectedPlanForRoute.stops[selectedStopIndex] : null
  const selectedStopCoordinate = selectedStop ? getMultiStopCoordinate(selectedStop) : null

  return (
    <div className="relative w-full h-full">
      {pickMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-slate-900/90 text-white text-sm px-4 py-1.5 shadow-lg">
          Click the map to set the {pickMode === 'origin' ? 'origin' : 'destination'}
        </div>
      )}
      {directionsError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-md bg-red-600/95 text-white text-sm px-4 py-1.5 shadow-lg max-w-[90%] text-center">
          {directionsError}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center ?? DEFAULT_CENTER}
        zoom={13}
        onClick={handleClick}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {origin && <Marker position={origin} icon={ORIGIN_ICON} title="Origin" />}
        {destination && <Marker position={destination} icon={DEST_ICON} title="Destination" />}

        {selectedPlanForRoute?.stops.map((stop, index) => {
            const position = getMultiStopCoordinate(stop)
            if (!position) return null
            return (
              <Marker
                key={index}
                position={position}
                icon={STATION_ICON}
                label={{ text: String(index + 1), color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                onClick={() => setSelectedStopIndex(index)}
              />
            )
          })}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#059669', strokeWeight: 5 } }}
          />
        )}

        {selectedStop && selectedStopCoordinate && (
          <InfoWindow position={selectedStopCoordinate} onCloseClick={() => setSelectedStopIndex(null)}>
            <div className="text-sm text-slate-800 min-w-40">
              <p className="font-semibold">{selectedStop.station.displayName.text}</p>
              <p className="text-slate-500 mb-1">{selectedStop.station.formattedAddress}</p>
              <p className="font-medium text-emerald-600 mb-1">
                {currencySymbol(getStopCurrencyCode(selectedStop))}
                {selectedStop.pricePerLiter.toFixed(3)} / L · {selectedStop.litersPurchased.toFixed(1)} L
              </p>
              {selectedStop.station.id && (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${selectedStop.station.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View station on Google Maps
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

export function MapView(props: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  if (!apiKey) {
    return (
      <MapMessage>
        Missing Google Maps API key. Set <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your{' '}
        <code className="font-mono">.env</code> file to enable the map.
      </MapMessage>
    )
  }

  return <LoadedMapView {...props} apiKey={apiKey} />
}
