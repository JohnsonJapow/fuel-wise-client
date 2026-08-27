import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  AuthContextValue,
  LoginInput,
  RegisterInput,
  TerminateAccountInput,
  UpdateEmailInput,
  UpdatePasswordInput,
  UpdateProfileInput,
  UserProfile,
} from '../types/auth'
import {
  loginUser,
  registerUser,
  terminateAccount as terminateAccountApi,
  updateEmail as updateEmailApi,
  updatePassword as updatePasswordApi,
  updateProfile as updateProfileApi,
  verifyEmail as verifyEmailApi,
} from '../services/api'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setAccountTerminatedFlag,
  setPasswordChangedFlag,
  setSessionExpiredFlag,
  setStoredAuth,
} from '../utils/authStorage'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = getStoredToken()
    const storedUser = getStoredUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  async function register(input: RegisterInput) {
    if (input.password !== input.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    await registerUser(input)
  }

  async function login(input: LoginInput) {
    const { token: newToken, user: profile } = await loginUser(input)
    setStoredAuth(newToken, profile)
    setToken(newToken)
    setUser(profile)
  }

  // Activates the account (UNVERIFIED -> ACTIVE) and logs the user in with the returned JWT,
  // same as a successful login.
  async function verifyEmail(token: string) {
    const { token: newToken, user: profile } = await verifyEmailApi({ token })
    setStoredAuth(newToken, profile)
    setToken(newToken)
    setUser(profile)
  }

  function logout(reason?: 'expired') {
    if (reason === 'expired') setSessionExpiredFlag()
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  async function updateProfile(updates: UpdateProfileInput) {
    const updated = await updateProfileApi(updates)
    setUser(updated)
    if (token) setStoredAuth(token, updated)
  }

  // Password change bumps the server-side token version, invalidating this session's token —
  // clear local auth state so the user is routed back to login rather than left with a dead token.
  async function changePassword(input: UpdatePasswordInput) {
    await updatePasswordApi(input)
    setPasswordChangedFlag()
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  async function changeEmail(input: UpdateEmailInput) {
    const { token: newToken, user: profile } = await updateEmailApi(input)
    setStoredAuth(newToken, profile)
    setToken(newToken)
    setUser(profile)
  }

  // Termination bumps the token version server-side too, so clear local auth state the same way.
  async function terminateAccount(input: TerminateAccountInput) {
    await terminateAccountApi(input)
    setAccountTerminatedFlag()
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    changeEmail,
    terminateAccount,
    verifyEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
