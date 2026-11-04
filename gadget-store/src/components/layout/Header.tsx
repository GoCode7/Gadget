import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { store } from '../../data/store'

const navigation = [
  { label: 'Shop devices', href: '#products' },
  { label: 'Categories', href: '#categories' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    if (isMenuOpen) {
      menuButtonRef.current?.focus()
    }

    setIsMenuOpen(false)
  }

  return (
    <header
      className="af-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isMenuOpen) {
          event.preventDefault()
          closeMenu()
        }
      }}
    >
      <a href="#main-content" className="af-skip-link">
        Skip to content
      </a>

      <div className="af-announcement">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2">
            <span
              className="af-status-dot"
              aria-hidden="true"
            />
            Your next device starts here.
          </p>

          <span className="hidden sm:block">
            Nigeria · Prices in NGN
          </span>
        </div>
      </div>

      <div className="af-header-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center gap-5">
            <Link
              to="/"
              onClick={closeMenu}
              aria-label={`${store.name} home`}
              className="af-brand"
            >
              <span
                className="af-brand-symbol"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <path
                    d="m13.5 3-8 10h6l-1 8 8-11h-6l1-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-slate-950">
                  {store.name}
                  <span className="text-blue-600">.</span>
                </span>

                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Your everyday upgrade
                </span>
              </span>
            </Link>

            <nav
              aria-label="Main navigation"
              className="ml-auto hidden items-center gap-8 md:flex"
            >
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="af-nav-link"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="af-mobile-controls ml-auto flex items-center md:hidden">
              <button
                ref={menuButtonRef}
                type="button"
                aria-label={
                  isMenuOpen
                    ? 'Close navigation'
                    : 'Open navigation'
                }
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => {
                  if (isMenuOpen) {
                    closeMenu()
                  } else {
                    setIsMenuOpen(true)
                  }
                }}
                className="af-menu-button"
              >
                <span
                  className={`af-menu-icon ${
                    isMenuOpen ? 'is-open' : ''
                  }`}
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            </div>
          </div>

          <div
            inert={!isMenuOpen}
            className={`af-mobile-menu md:hidden ${
              isMenuOpen ? 'is-open' : ''
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                className="border-t border-slate-200 pb-6 pt-3"
              >
                {navigation.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    tabIndex={isMenuOpen ? 0 : -1}
                    className="af-mobile-link"
                  >
                    <span className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-400">
                        0{index + 1}
                      </span>

                      {item.label}
                    </span>

                    <span aria-hidden="true">↗</span>
                  </a>
                ))}

                <a
                  href={`https://wa.me/${store.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={closeMenu}
                  className="af-contact-button mt-4 flex w-full justify-center"
                >
                  Enquire on WhatsApp
                  <span
                    aria-hidden="true"
                    className="af-button-arrow"
                  >
                    ↗
                  </span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}