import { useCallback, useEffect, useState } from 'react'
import { DirectionsRenderer, GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { LatLng, RouteAdviceOption } from '../types/api'
import { getStationCoordinate } from '../utils/routeAdvice'

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' }

const DEFAULT_CENTER: LatLng = { lat: 52.52, lng: 13.405 }

const ORIGIN_ICON = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
const DEST_ICON = 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
const CHEAPEST_ICON = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
const STATION_ICON = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'

type PickMode = 'origin' | 'destination' | null

interface MapViewProps {
  center: LatLng
  adviceOptions: RouteAdviceOption[]
  cheapestAdviceIndex: number | null
  origin: LatLng | null
  destination: LatLng | null
  pickMode: PickMode
  onMapClick: (loc: LatLng) => void
  selectedAdviceIndex: number | null
  onSelectAdvice: (index: number | null) => void
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
    adviceOptions,
    cheapestAdviceIndex,
    origin,
    destination,
    pickMode,
    onMapClick,
    selectedAdviceIndex,
    onSelectAdvice,
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
  const [infoWindowOpen, setInfoWindowOpen] = useState(false)

  // Reopen the InfoWindow whenever a new station is selected, but leave it
  // closeable independently so dismissing it doesn't clear the route below.
  useEffect(() => {
    setInfoWindowOpen(selectedAdviceIndex != null)
  }, [selectedAdviceIndex])

  const selectedOptionForRoute = selectedAdviceIndex != null ? adviceOptions[selectedAdviceIndex] : null

  useEffect(() => {
    if (!isLoaded || !selectedOptionForRoute || !origin || !destination) {
      setDirections(null)
      setDirectionsError(null)
      return
    }
    const waypoint = getStationCoordinate(selectedOptionForRoute)
    if (!waypoint) {
      setDirections(null)
      setDirectionsError(null)
      return
    }
    let cancelled = false
    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
      {
        origin,
        destination,
        waypoints: [{ location: waypoint, stopover: true }],
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
  }, [isLoaded, selectedOptionForRoute, origin, destination])

  if (loadError) {
    return <MapMessage tone="error">Failed to load Google Maps. Check your API key and network.</MapMessage>
  }

  if (!isLoaded) {
    return <MapMessage>Loading map…</MapMessage>
  }

  const selectedOption = selectedOptionForRoute
  const selectedCoordinate = selectedOption ? getStationCoordinate(selectedOption) : null

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

        {adviceOptions.map((option, index) => {
          const position = getStationCoordinate(option)
          if (!position) return null
          return (
            <Marker
              key={index}
              position={position}
              icon={index === cheapestAdviceIndex ? CHEAPEST_ICON : STATION_ICON}
              onClick={() => onSelectAdvice(index)}
            />
          )
        })}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#059669', strokeWeight: 5 } }}
          />
        )}

        {selectedOption && selectedCoordinate && infoWindowOpen && (
          <InfoWindow position={selectedCoordinate} onCloseClick={() => setInfoWindowOpen(false)}>
            <div className="text-sm text-slate-800 min-w-40">
              <p className="font-semibold">{selectedOption.station.displayName.text}</p>
              <p className="text-slate-500 mb-1">{selectedOption.station.formattedAddress}</p>
              <p className="font-medium text-emerald-600 mb-1">€{selectedOption.fuelPricePerLiter.toFixed(3)} / L</p>
              {selectedOption.station.id && (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${selectedOption.station.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View on Google Maps
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
