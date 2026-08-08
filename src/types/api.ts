export interface RouteAdviceRequest {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  fuelType: string
  tankCapacityLiters?: number
  currentFuelLiters?: number
  fuelEfficiencyKml?: number
}

export interface MoneyAmount {
  currencyCode: string
  units: number
  nanos: number
}

export interface StationFuelPrice {
  type: string | null
  price: MoneyAmount | null
  updateTime: string | null
}

export interface RouteLatLng {
  latitude: number
  longitude: number
}

export interface StationInfo {
  id: string
  formattedAddress: string
  priceLevel: string | null
  fuelOptions: {
    fuelPrices: StationFuelPrice[]
  }
  displayName: {
    text: string
    languageCode: string
  }
  location?: RouteLatLng
}

export interface RouteLeg {
  duration: string
  distanceMeters: number
  startLocation?: { latLng: RouteLatLng }
  endLocation?: { latLng: RouteLatLng }
}

export interface RoutingSummary {
  legs: RouteLeg[]
  directionsUri: string
}

export interface RouteAdviceOption {
  station: StationInfo
  routingSummary: RoutingSummary
  fuelPricePerLiter: number
  totalCostOffset: number
  addedSeconds: number
  addedMeters: number
}

export type RouteAdviceResponse = RouteAdviceOption[]

export interface MultiStopRouteAdviceRequest {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  fuelType: string
  tankCapacityLiters?: number
  currentFuelLiters?: number
  fuelEfficiencyKml?: number
  segmentDistanceMeters?: number
  locationBiasRadiusMeters?: number
}

export interface MultiStopStop {
  station: StationInfo
  pricePerLiter: number
  litersPurchased: number
  positionMeters: number
  addedMeters: number
  addedSeconds: number
  stopCost: number
}

export interface MultiStopPlan {
  stops: MultiStopStop[]
  totalCost: number
  totalAddedSeconds: number
  totalAddedMeters: number
  directionsUri: string
}

export type MultiStopRouteAdviceResponse = MultiStopPlan[]

export interface LatLng {
  lat: number
  lng: number
}
