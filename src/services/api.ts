import type { RouteAdviceRequest, RouteAdviceResponse } from '../types/api'
import type { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from '../types/auth'
import { getStoredToken } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Please check your input and try again.',
  401: 'Invalid email or password.',
  409: 'An account with this email already exists.',
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = STATUS_FALLBACK_MESSAGES[res.status] ?? `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      message = body?.message ?? body?.error ?? message
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

export async function fetchRouteAdvice(body: RouteAdviceRequest): Promise<RouteAdviceResponse> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/v1/routes/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<RouteAdviceResponse>(res)
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

export { ApiError }
