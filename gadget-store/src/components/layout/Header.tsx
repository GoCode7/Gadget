import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { store } from '../../data/store'

const navigation = [
  { label: 'Shop devices', to: '/shop' },
  { label: 'Categories', to: '/#categories' },
  { label: 'Contact', to: '/#contact' },
]

export default function Header() {
  const location = useLocation()
  const { pathname, hash } = location

  const [openMenuLocation, setOpenMenuLocation] =
    useState<string | null>(null)

  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // A menu opened on another navigation entry stays closed.
  const isMenuOpen = openMenuLocation === location.key

  function closeMenu() {
    // Move focus before making the menu inert.
    if (isMenuOpen) {
      menuButtonRef.current?.focus({ preventScroll: true })
    }

    setOpenMenuLocation(null)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')

    function handleDesktopChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpenMenuLocation(null)
      }
    }

    mediaQuery.addEventListener('change', handleDesktopChange)

    return () => {
      mediaQuery.removeEventListener('change', handleDesktopChange)
    }
  }, [])

  function isActive(to: string) {
    if (to === '/shop') {
      return pathname === '/shop'
    }

    return pathname === '/' && to === `/${hash}`
  }

  function getCurrent(
    to: string,
  ): 'page' | 'location' | undefined {
    if (!isActive(to)) return undefined
    return to === '/shop' ? 'page' : 'location'
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
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={getCurrent(item.to)}
                  className="af-nav-link"
                  style={
                    isActive(item.to)
                      ? {
                          color: '#2563eb',
                          boxShadow: '0 2px 0 #2563eb',
                        }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
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
                    setOpenMenuLocation(location.key)
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
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    aria-current={getCurrent(item.to)}
                    tabIndex={isMenuOpen ? 0 : -1}
                    className="af-mobile-link"
                    style={
                      isActive(item.to)
                        ? {
                            color: '#2563eb',
                            backgroundColor: '#eff6ff',
                          }
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-400">
                        0{index + 1}
                      </span>
                      {item.label}
                    </span>

                    <span aria-hidden="true">↗</span>
                  </Link>
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