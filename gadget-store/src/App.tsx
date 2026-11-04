import { Link, Route, Routes } from 'react-router'
import StorefrontPage from './pages/StoreFrontPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />

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

      <Route
        path="*"
        element={
          <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
            <p className="font-semibold text-blue-700">404</p>

            <h1 className="mt-3 text-3xl font-bold">
              Page not found
            </h1>

            <Link
              to="/"
              className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Return to AfeTech
            </Link>
          </main>
        }
      />
    </Routes>
  )
}