import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // Guards against React 18 StrictMode's double-invoked effect firing the
  // single-use verification token twice.
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (!token) {
      setError('This verification link is missing its token.')
      return
    }

    verifyEmail(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Verification failed'))
  }, [token, verifyEmail, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Verification failed</h1>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="flex justify-center gap-4 text-sm">
              <Link to="/login" className="text-emerald-600 hover:underline">
                Log in
              </Link>
              <Link to="/register" className="text-emerald-600 hover:underline">
                Register again
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Verifying your email…</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Please wait a moment.</p>
          </>
        )}
      </div>
    </div>
  )
}
