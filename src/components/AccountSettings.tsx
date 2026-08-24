import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, KeyRound, Mail, ShieldAlert, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'

interface AccountSettingsProps {
  onClose: () => void
}

export function AccountSettings({ onClose }: AccountSettingsProps) {
  const { user, changePassword, changeEmail, terminateAccount } = useAuth()
  const navigate = useNavigate()

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [terminatePassword, setTerminatePassword] = useState('')
  const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false)
  const [terminating, setTerminating] = useState(false)
  const [terminateError, setTerminateError] = useState<string | null>(null)

  if (!user) return null

  async function handleChangeEmail(e: FormEvent) {
    e.preventDefault()
    setEmailError(null)
    setEmailSuccess(false)
    setEmailSaving(true)
    try {
      await changeEmail({ newEmail: newEmail.trim(), currentPassword: emailPassword })
      setEmailSuccess(true)
      setNewEmail('')
      setEmailPassword('')
      setTimeout(() => setEmailSuccess(false), 2500)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setEmailSaving(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      await changePassword({ currentPassword, newPassword })
      navigate('/login', { replace: true, state: { passwordChanged: true } })
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
      setPasswordSaving(false)
    }
  }

  async function handleTerminateAccount(e: FormEvent) {
    e.preventDefault()
    setTerminateError(null)
    setTerminating(true)
    try {
      await terminateAccount({ currentPassword: terminatePassword })
      navigate('/login', { replace: true, state: { accountTerminated: true } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setTerminateError('Current password is incorrect.')
      } else {
        setTerminateError(err instanceof Error ? err.message : 'Failed to terminate account')
      }
      setTerminating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <section className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Mail size={16} /> Change Email
        </h3>
        <form className="space-y-3" onSubmit={handleChangeEmail}>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Email</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new-address@example.com"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={emailSaving}
            className="w-full rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white text-sm font-medium py-2 transition-colors"
          >
            {emailSaving ? 'Updating…' : 'Update Email'}
          </button>
          {emailSuccess && <p className="text-xs text-emerald-600">Email updated.</p>}
          {emailError && <p className="text-xs text-red-600">{emailError}</p>}
        </form>
      </section>

      <section className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <KeyRound size={16} /> Change Password
        </h3>
        <form className="space-y-3" onSubmit={handleChangePassword}>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white text-sm font-medium py-2 transition-colors"
          >
            {passwordSaving ? 'Updating…' : 'Update Password'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You'll be signed out and asked to log in again after this change.
          </p>
          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
        </form>
      </section>

      <section className="px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-3">
          <ShieldAlert size={16} /> Terminate Account
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          This permanently deactivates your account and immediately signs you out everywhere. This cannot be undone.
        </p>
        {!terminateConfirmOpen ? (
          <button
            type="button"
            onClick={() => setTerminateConfirmOpen(true)}
            className="w-full rounded-md border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium py-2 transition-colors"
          >
            Terminate Account
          </button>
        ) : (
          <form className="space-y-3" onSubmit={handleTerminateAccount}>
            <div className="flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-xs text-red-700 dark:text-red-300">
                Confirm your password to permanently terminate your account.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={terminatePassword}
                onChange={(e) => setTerminatePassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTerminateConfirmOpen(false)
                  setTerminatePassword('')
                  setTerminateError(null)
                }}
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={terminating}
                className="flex-1 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium py-2 transition-colors"
              >
                {terminating ? 'Terminating…' : 'Confirm Terminate'}
              </button>
            </div>
            {terminateError && <p className="text-xs text-red-600">{terminateError}</p>}
          </form>
        )}
      </section>
      </div>
    </div>
  )
}
