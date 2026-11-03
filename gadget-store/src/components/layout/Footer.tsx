import { store } from '../../data/store'
import { categories } from '../../data/categories'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <a
            href="/"
            className="rounded text-2xl font-extrabold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {store.name}
          </a>

          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Phones, tablets, laptops, gaming consoles, and
            accessories. Find your next device and enquire
            directly on WhatsApp.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Our categories</h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold">Get in touch</h2>

          <p className="mt-4 text-sm text-slate-600">
            {store.country}
          </p>

          <a
            href={`https://wa.me/${store.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            WhatsApp: {store.phoneDisplay}
          </a>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Contact us to confirm availability, delivery costs,
            and payment arrangements before ordering.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {store.name}. All rights
        reserved.
      </div>
    </footer>
  )
}