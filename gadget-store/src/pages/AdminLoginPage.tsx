import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const { data, error } =
        await getSupabaseClient().auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error || !data.session) {
        setErrorMessage(
          'Sign-in failed. Check your email and password, and confirm that your email is verified.',
        )
        return
      }

      setPassword('')
      navigate('/admin', { replace: true })
    } catch {
      setErrorMessage(
        'Unable to connect. Check your internet connection and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="block text-center text-3xl font-extrabold text-blue-700"
        >
          AfeTech
        </Link>

        <section
          aria-labelledby="login-heading"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <h1 id="login-heading" className="text-2xl font-bold">
            Admin sign in
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Use your authorised AfeTech admin account.
          </p>

          {!isSupabaseConfigured && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800"
            >
              Admin sign-in is unavailable. Set VITE_SUPABASE_URL and
              {' '}VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart
              the development server.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={isSubmitting || !isSupabaseConfigured}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrorMessage('')
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-2 focus:outline-blue-600 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting || !isSupabaseConfigured}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrorMessage('')
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-2 focus:outline-blue-600 disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isSupabaseConfigured}
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-medium text-blue-700 hover:underline"
        >
          Back to storefront
        </Link>
      </div>
    </main>
  )
}