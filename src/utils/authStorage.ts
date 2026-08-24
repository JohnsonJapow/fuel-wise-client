import type { UserProfile } from '../types/auth'

const TOKEN_KEY = 'fuelwise_token'
const USER_KEY = 'fuelwise_user'
const SESSION_EXPIRED_KEY = 'fuelwise_session_expired'
const PASSWORD_CHANGED_KEY = 'fuelwise_password_changed'
const ACCOUNT_TERMINATED_KEY = 'fuelwise_account_terminated'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setStoredAuth(token: string, user: UserProfile) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Set right before a forced logout so the Login page can show a message even if
// ProtectedRoute's own (state-less) redirect wins the race against the caller's navigate().
export function setSessionExpiredFlag() {
  sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
}

export function consumeSessionExpiredFlag(): boolean {
  const value = sessionStorage.getItem(SESSION_EXPIRED_KEY)
  if (value) sessionStorage.removeItem(SESSION_EXPIRED_KEY)
  return value === '1'
}

// Same rationale as setSessionExpiredFlag/consumeSessionExpiredFlag above: changePassword and
// terminateAccount clear auth state, which races ProtectedRoute's own redirect-to-login against the
// caller's explicit navigate() with location.state — the sessionStorage flag survives that race.
export function setPasswordChangedFlag() {
  sessionStorage.setItem(PASSWORD_CHANGED_KEY, '1')
}

export function consumePasswordChangedFlag(): boolean {
  const value = sessionStorage.getItem(PASSWORD_CHANGED_KEY)
  if (value) sessionStorage.removeItem(PASSWORD_CHANGED_KEY)
  return value === '1'
}

export function setAccountTerminatedFlag() {
  sessionStorage.setItem(ACCOUNT_TERMINATED_KEY, '1')
}

export function consumeAccountTerminatedFlag(): boolean {
  const value = sessionStorage.getItem(ACCOUNT_TERMINATED_KEY)
  if (value) sessionStorage.removeItem(ACCOUNT_TERMINATED_KEY)
  return value === '1'
}
