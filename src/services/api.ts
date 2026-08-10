import type {
  MultiStopRouteAdviceRequest,
  MultiStopRouteAdviceResponse,
} from '../types/api'
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  UpdateProfileInput,
  UpdateProfileResponse,
} from '../types/auth'
import { getStoredToken } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

class ApiError extends Error {
  status: number
  reason?: string

  constructor(status: number, message: string, reason?: string) {
    super(message)
    this.status = status
    this.reason = reason
  }
}

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Please check your input and try again.',
  401: 'Invalid email or password.',
  409: 'An account with this email already exists.',
}

// Suggested messages for /routes/advice/multi-stop 404 `reason` values (see 3.5 in claude.md).
const ADVICE_404_REASON_MESSAGES: Record<string, string> = {
  NO_ROUTE_FOUND: 'No driving route exists between these locations.',
  NO_STATIONS_FOUND: 'No gas stations found along this route.',
  NO_FUEL_PRICE_DATA: "Fuel price data isn't available for this area.",
  FUEL_TYPE_UNAVAILABLE: 'No stations report a price for this fuel type here. Try another fuel type.',
  OUT_OF_RANGE: "This trip isn't reachable with your current tank range. Try increasing tank capacity or starting fuel.",
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = STATUS_FALLBACK_MESSAGES[res.status] ?? `Request failed with status ${res.status}`
    let reason: string | undefined
    try {
      const body = await res.json()
      if (res.status === 404 && typeof body?.reason === 'string') {
        reason = body.reason
        message = ADVICE_404_REASON_MESSAGES[body.reason] ?? body.message ?? body.error ?? message
      } else if (res.status === 400 && body && typeof body === 'object' && !body.message && !body.error) {
        // Validation errors come back as { "<fieldName>": "<message>", ... }.
        const fieldErrors = Object.entries(body)
          .filter(([, v]) => typeof v === 'string')
          .map(([field, msg]) => `${field}: ${msg}`)
        if (fieldErrors.length > 0) message = fieldErrors.join('; ')
      } else {
        message = body?.message ?? body?.error ?? message
      }
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message, reason)
  }
  return res.json() as Promise<T>
}

// Deprecated: single-stop /routes/advice is superseded by fetchMultiStopRouteAdvice (see 3.5 in claude.md).
// export async function fetchRouteAdvice(body: RouteAdviceRequest): Promise<RouteAdviceResponse> {
//   const token = getStoredToken()
//   const res = await fetch(`${API_BASE_URL}/api/v1/routes/advice`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: JSON.stringify(body),
//   })
//   return handleResponse<RouteAdviceResponse>(res)
// }

export async function fetchMultiStopRouteAdvice(body: MultiStopRouteAdviceRequest): Promise<MultiStopRouteAdviceResponse> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/routes/advice/multi-stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<MultiStopRouteAdviceResponse>(res)
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      vehicleType: input.vehicleType,
      fuelEfficiency: input.fuelEfficiency,
      tankCapacity: input.tankCapacity,
    }),
  })
  return handleResponse<RegisterResponse>(res)
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<LoginResponse>(res)
}

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResponse> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  })
  return handleResponse<UpdateProfileResponse>(res)
}

export { ApiError }
