import { useState } from 'react'
import { store } from '../../data/store'

const navigation = [
  { label: 'Products', href: '#products' },
  { label: 'Categories', href: '#categories' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a
            href="/"
            aria-label={`${store.name} home`}
            className="rounded text-2xl font-extrabold tracking-tight text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {store.name}
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded text-sm font-medium text-slate-700 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 md:hidden"
          >
            {isMenuOpen ? 'Close menu' : 'Menu'}
          </button>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          hidden={!isMenuOpen}
          className="border-t border-slate-200 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}