import type {
  MultiStopRouteAdviceRequest,
  MultiStopRouteAdviceResponse,
  RecalculateSavedRouteRequest,
  RecalculateSavedRouteResponse,
  SaveRouteRequest,
  SavedRoute,
  SavedRouteSummary,
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
import { NO_PLAN_REASON_MESSAGES } from '../utils/routeAdvice'

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

async function handleResponse<T>(res: Response, statusMessages?: Record<number, string>): Promise<T> {
  if (!res.ok) {
    let message =
      statusMessages?.[res.status] ?? STATUS_FALLBACK_MESSAGES[res.status] ?? `Request failed with status ${res.status}`
    let reason: string | undefined
    try {
      const body = await res.json()
      if (res.status === 404 && typeof body?.reason === 'string') {
        reason = body.reason
        message = NO_PLAN_REASON_MESSAGES[body.reason as keyof typeof NO_PLAN_REASON_MESSAGES] ?? body.message ?? body.error ?? message
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
  const res = await fetch(`${API_BASE_URL}/api/v1/routes/multi-advices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<MultiStopRouteAdviceResponse>(res)
}

export async function saveRoute(input: SaveRouteRequest): Promise<SavedRouteSummary> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/saved-routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  })
  return handleResponse<SavedRouteSummary>(res, {
    409: 'You already have this exact trip saved.',
  })
}

export async function fetchSavedRoutes(): Promise<SavedRoute[]> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/saved-routes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return handleResponse<SavedRoute[]>(res)
}

export async function deleteSavedRoute(id: string): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/saved-routes/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 204) return
  await handleResponse<void>(res)
}

export async function recalculateSavedRoute(
  savedRouteId: string,
  body: RecalculateSavedRouteRequest,
): Promise<RecalculateSavedRouteResponse> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/saved-routes/${savedRouteId}/recalculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<RecalculateSavedRouteResponse>(res, {
    404: 'No saved route found with that id.',
  })
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
