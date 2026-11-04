import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link, Navigate } from 'react-router'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'

type RequireAdminProps = {
  children: ReactNode
}

type AccessCheck = {
  token: string
  allowed: boolean
  error: string
}

export default function RequireAdmin({
  children,
}: RequireAdminProps) {
  const [session, setSession] =
    useState<Session | null | undefined>(undefined)

  const [access, setAccess] = useState<AccessCheck | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    let cancelled = false
    const token = session.access_token

    async function checkAdmin() {
      try {
        const { data, error } =
          await getSupabaseClient().rpc('is_admin')

        if (cancelled) return

        setAccess({
          token,
          allowed: !error && data === true,
          error: error
            ? 'Unable to verify admin access. Check your connection and try again.'
            : '',
        })
      } catch {
        if (!cancelled) {
          setAccess({
            token,
            allowed: false,
            error: 'Unable to verify admin access. Please try again.',
          })
        }
      }
    }

    void checkAdmin()

    return () => {
      cancelled = true
    }
  }, [session])

  async function handleSignOut() {
    setSigningOut(true)
    setSignOutError('')

    try {
      const { error } = await getSupabaseClient().auth.signOut({
        scope: 'local',
      })

      if (error) throw error
    } catch {
      setSignOutError('Unable to sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
        <h1 className="text-2xl font-bold">
          Admin authentication is not configured
        </h1>

        <p className="mt-4 max-w-lg text-slate-600">
          Set VITE_SUPABASE_URL and
          {' '}VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart
          the development server.
        </p>

        <Link
          to="/"
          className="mt-6 rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          View storefront
        </Link>
      </main>
    )
  }

  if (session === undefined) {
    return (
      <main className="p-8 text-center" role="status">
        Checking your session…
      </main>
    )
  }

  if (session === null) {
    return <Navigate to="/admin/login" replace />
  }

  const checking =
    !access || access.token !== session.access_token

  if (checking) {
    return (
      <main className="p-8 text-center" role="status">
        Checking admin access…
      </main>
    )
  }

  const signOutButton = (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
    >
      {signingOut ? 'Signing out…' : 'Sign out'}
    </button>
  )

  if (!access.allowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
        <h1 className="text-2xl font-bold">
          {access.error ? 'Access check failed' : 'Access denied'}
        </h1>

        <p className="mt-4 max-w-md text-slate-600">
          {access.error ||
            'This account does not have AfeTech admin permission.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-lg bg-blue-700 px-4 py-2 text-white"
          >
            View storefront
          </Link>

          {signOutButton}

          {access.error && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              Retry
            </button>
          )}
        </div>

        {signOutError && (
          <p role="alert" className="mt-4 text-red-700">
            {signOutError}
          </p>
        )}
      </main>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <span className="break-all text-sm text-slate-600">
          {session.user.email}
        </span>

        {signOutButton}

        {signOutError && (
          <p role="alert" className="text-sm text-red-700">
            {signOutError}
          </p>
        )}
      </div>

      {children}
    </>
  )
}