export interface UserProfile {
  id: string
  email: string
  vehicleType: string
  fuelEfficiency: number
  tankCapacity: number
}

export interface RegisterInput {
  email: string
  password: string
  confirmPassword: string
  vehicleType: string
  fuelEfficiency: number
  tankCapacity: number
}

export interface LoginInput {
  email: string
  password: string
}

export type RegisterResponse = UserProfile

export interface LoginResponse {
  token: string
  user: UserProfile
}

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (input: RegisterInput) => Promise<void>
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<Pick<UserProfile, 'fuelEfficiency' | 'tankCapacity'>>) => void
}
