import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDisabled = isSubmitting || !isSupabaseConfigured

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submittingRef.current || !isSupabaseConfigured) return

    submittingRef.current = true
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
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-slate-900 lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative isolate hidden overflow-hidden bg-[#0b1739] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[480px] w-[480px] rounded-full bg-blue-600/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[480px] w-[480px] rounded-full bg-sky-500/15 blur-3xl"
        />

        <Link
          to="/"
          aria-label="AfeTech storefront"
          className="inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sky-300"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black shadow-lg shadow-blue-950/30">
            A
          </span>

          <span className="text-2xl font-extrabold tracking-tight">
            Afe<span className="text-sky-400">Tech</span>
          </span>
        </Link>

        <div className="max-w-lg py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-widest text-blue-100 uppercase">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-sky-400"
            />
            Admin workspace
          </span>

          <h2 className="mt-8 text-5xl font-extrabold leading-[1.12] tracking-tight xl:text-6xl">
            Behind every
            <br />
            great gadget
            <br />
            <span className="text-sky-400">is a great store.</span>
          </h2>

          <p className="mt-6 max-w-sm text-base leading-8 text-slate-300">
            Your workspace for keeping the AfeTech catalogue
            organised, current, and ready for customers.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                Product catalogue
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Keep your gadget listings up to date.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                Store presentation
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Give every product a clear first impression.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs tracking-wide text-slate-400">
          AfeTech · Authorised administrators only
        </p>
      </aside>

      {/* Login panel */}
      <div className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg text-xl font-extrabold tracking-tight text-[#0b1739] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 lg:hidden"
          >
            Afe<span className="text-blue-600">Tech</span>
          </Link>

          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M5 12h14" />
            </svg>
            Back to store
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <section
            aria-labelledby="login-heading"
            className="w-full max-w-md"
          >
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="3" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </div>

            <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">
              AfeTech administration
            </p>

            <h1
              id="login-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0b1739] sm:text-4xl"
            >
              Welcome back.
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Sign in with your authorised admin account to
              manage your store.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_60px_-24px_rgba(11,23,57,0.18)] sm:p-8">
              {!isSupabaseConfigured && (
                <p
                  role="alert"
                  className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                >
                  Admin sign-in is temporarily unavailable.
                  Please contact the store administrator.
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                aria-busy={isSubmitting}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="Enter your email address"
                    required
                    disabled={isDisabled}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setErrorMessage('')
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                      disabled={isDisabled}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setErrorMessage('')
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-4 pr-20 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={isDisabled}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      aria-controls="admin-password"
                      className="absolute inset-y-1.5 right-1.5 rounded-lg px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity="0.25"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-6 text-slate-500">
                Access is restricted to authorised AfeTech
                administrators.
              </p>
            </div>
          </section>
        </div>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AfeTech
        </p>
      </div>
    </main>
  )
}