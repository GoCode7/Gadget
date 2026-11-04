import { Link } from 'react-router'
import { categories } from '../../data/categories'
import { store } from '../../data/store'

const navigation = [
  { label: 'Shop devices', to: '/shop' },
  { label: 'Categories', to: '/#categories' },
  { label: 'Contact', to: '/#contact' },
]

const linkClassName =
  'rounded text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#0b1224] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1.2fr] lg:gap-10 lg:py-16">
          <div>
            <Link
              to="/"
              aria-label={`${store.name} home`}
              className="inline-flex rounded text-2xl font-extrabold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              {store.name}
              <span className="text-blue-400">.</span>
            </Link>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
              Your everyday upgrade
            </p>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Explore phones, laptops, tablets, gaming consoles,
              and accessories. Find your next device with AfeTech.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Explore
            </h2>

            <ul className="mt-5 space-y-4">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product categories">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Shop by category
            </h2>

            <ul className="mt-5 space-y-4">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/shop?${new URLSearchParams({
                      category,
                    }).toString()}`}
                    className={linkClassName}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Let’s talk tech
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
              Have a device in mind? Ask about specifications,
              availability, and delivery.
            </p>

            <a
              href={`https://wa.me/${store.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-4 rounded-lg border border-slate-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-blue-400 hover:bg-blue-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Chat on WhatsApp
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-800 py-6 text-xs leading-6 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {store.name}. All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span>Nigeria · Prices in NGN</span>

            <a
              href="#main-content"
              className="rounded font-semibold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}