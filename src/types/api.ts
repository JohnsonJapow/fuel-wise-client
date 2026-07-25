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
  type: string
  price: MoneyAmount
  updateTime: string
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

export interface LatLng {
  lat: number
  lng: number
}
