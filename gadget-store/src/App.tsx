import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import StorefrontPage from './pages/StoreFrontPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import RequireAdmin from './components/RequireAdmin'
import ShopPage from './pages/ShopPage'

function PageNavigation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        let targetId: string

        try {
          targetId = decodeURIComponent(hash.slice(1))
        } catch {
          targetId = hash.slice(1)
        }

        const target = document.getElementById(targetId)

        if (target) {
          target.scrollIntoView({
            behavior: 'instant',
            block: 'start',
          })
          return
        }
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6 py-16 text-center text-slate-900">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-[0_16px_60px_-30px_rgba(11,23,57,0.2)] sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          AfeTech
        </p>

        <p className="mt-6 text-8xl font-extrabold tracking-tight text-[#0b1739]">
          404
        </p>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          This page may have moved, or the link may be incorrect.
          Head back to the store to keep exploring.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Return home
          </Link>

          <Link
            to="/shop"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <>
      <PageNavigation />

      <Routes>
        <Route path="/" element={<StorefrontPage />} />

        <Route path="/shop" element={<ShopPage />} />

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}