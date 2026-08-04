import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthContextValue, LoginInput, RegisterInput, UpdateProfileInput, UserProfile } from '../types/auth'
import { loginUser, registerUser, updateProfile as updateProfileApi } from '../services/api'
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../utils/authStorage'

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

  function logout() {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  async function updateProfile(updates: UpdateProfileInput) {
    const updated = await updateProfileApi(updates)
    setUser(updated)
    if (token) setStoredAuth(token, updated)
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
