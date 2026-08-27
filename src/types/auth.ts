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

export interface VerifyEmailInput {
  token: string
}

export type VerifyEmailResponse = LoginResponse

export interface UpdateProfileInput {
  vehicleType: string
  fuelEfficiency: number
  tankCapacity: number
}

export type UpdateProfileResponse = UserProfile

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}

export type UpdatePasswordResponse = UserProfile

export interface UpdateEmailInput {
  newEmail: string
  currentPassword: string
}

export interface UpdateEmailResponse {
  token: string
  user: UserProfile
}

export interface TerminateAccountInput {
  currentPassword: string
}

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (input: RegisterInput) => Promise<void>
  login: (input: LoginInput) => Promise<void>
  logout: (reason?: 'expired') => void
  updateProfile: (updates: UpdateProfileInput) => Promise<void>
  changePassword: (input: UpdatePasswordInput) => Promise<void>
  changeEmail: (input: UpdateEmailInput) => Promise<void>
  terminateAccount: (input: TerminateAccountInput) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
}
