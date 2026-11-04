import { useState } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CategorySection from '../components/CategorySection'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import { useProducts } from '../context/ProductsContext'
import { store } from '../data/store'
import type { ProductCategory } from '../types/product'

type SortOrder = 'default' | 'price-asc' | 'price-desc'

const priceFormatter = new Intl.NumberFormat(store.locale, {
  style: 'currency',
  currency: store.currency,
})

export default function StorefrontPage() {
  const {
    products,
    loading,
    loadError,
    refreshProducts,
  } = useProducts()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] =
    useState<SortOrder>('default')

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | 'All'>('All')

  const featuredProduct =
    products.find(
      (product) => product.availability === 'In stock',
    ) ?? products[0]

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      product.category === selectedCategory

    const searchableText = [
      product.name,
      product.brand,
      product.category,
      product.description,
    ]
      .join(' ')
      .toLowerCase()

    return (
      matchesCategory &&
      searchableText.includes(normalizedQuery)
    )
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') {
      return a.priceInKobo - b.priceInKobo
    }

    if (sortOrder === 'price-desc') {
      return b.priceInKobo - a.priceInKobo
    }

    return 0
  })

  const hasFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    sortOrder !== 'default'

  function clearFilters() {
    setSearchQuery('')
    setSelectedCategory('All')
    setSortOrder('default')
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Header />

      <main id="main-content" tabIndex={-1}>
        <section
          aria-labelledby="hero-heading"
          className="af-hero"
        >
          <div className="af-hero-glow" aria-hidden="true" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
            <div className="af-enter">
              <p className="af-eyebrow">
                <span aria-hidden="true" />
                THE AFETECH COLLECTION
              </p>

              <h1
                id="hero-heading"
                className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl"
              >
                Better tech.
                <br />
                <span className="af-gradient-text">
                  Your next move.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
                From your everyday essentials to your next big
                upgrade. Explore phones, laptops, tablets,
                gaming consoles, and accessories.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="af-primary-action"
                >
                  Explore devices
                  <span aria-hidden="true">↗</span>
                </a>

                <a
                  href={`https://wa.me/${store.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="af-secondary-action"
                >
                  Help me choose
                  <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-400">
                <span>Phones & tablets</span>
                <span aria-hidden="true" className="text-blue-500">
                  /
                </span>
                <span>Laptops & gaming</span>
                <span aria-hidden="true" className="text-blue-500">
                  /
                </span>
                <span>Everyday accessories</span>
              </div>
            </div>

            <div
              className="af-enter"
              style={{ animationDelay: '120ms' }}
            >
              {loading ? (
                <div
                  role="status"
                  aria-label="Loading featured product"
                  className="af-spotlight p-6"
                >
                  <div className="af-skeleton aspect-square rounded-2xl" />
                  <div className="af-skeleton mt-6 h-5 w-2/3 rounded" />
                  <div className="af-skeleton mt-3 h-4 w-1/3 rounded" />
                </div>
              ) : featuredProduct ? (
                <div className="af-spotlight">
                  <div className="flex items-center justify-between gap-4 px-6 pb-4 pt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      In the collection
                    </p>

                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600">
                      {featuredProduct.condition}
                    </span>
                  </div>

                  <div className="af-spotlight-image mx-5">
                    <ProductImage
                      key={featuredProduct.images[0] ?? 'featured'}
                      src={featuredProduct.images[0]}
                      alt={featuredProduct.name}
                    />
                  </div>

                  <div className="flex items-end justify-between gap-4 p-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                        {featuredProduct.category}
                      </p>

                      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                        {featuredProduct.name}
                      </h2>

                      <p className="mt-2 text-lg font-semibold text-slate-700">
                        {priceFormatter.format(
                          featuredProduct.priceInKobo / 100,
                        )}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {featuredProduct.availability}
                      </p>
                    </div>

                    <a
                      href="#products"
                      aria-label="Browse the product collection"
                      className="af-round-link"
                    >
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="af-hero-placeholder">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                    Work. Play. Connect.
                  </span>

                  <p className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-white">
                    Your everyday.
                    <br />
                    Upgraded.
                  </p>

                  <p className="mt-6 max-w-xs text-sm leading-7 text-slate-300">
                    Speak with AfeTech about the device you’re
                    looking for.
                  </p>

                  <a
                    href="#contact"
                    className="mt-8 inline-block text-sm font-semibold text-white underline decoration-blue-400 underline-offset-8"
                  >
                    Let’s find your next device ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              {
                number: '01',
                title: 'Find your fit',
                text: 'Explore devices by category.',
              },
              {
                number: '02',
                title: 'Know the details',
                text: 'Check condition and specifications.',
              },
              {
                number: '03',
                title: 'Talk to AfeTech',
                text: 'Confirm stock and delivery on WhatsApp.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="flex items-start gap-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  {item.number}
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CategorySection
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <section
            id="products"
            aria-labelledby="products-heading"
            className="scroll-mt-36 pb-16 pt-6 sm:pb-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="af-section-label">
                  EXPLORE THE COLLECTION
                </p>

                <h2
                  id="products-heading"
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {selectedCategory === 'All'
                    ? 'Your next upgrade.'
                    : selectedCategory}
                </h2>
              </div>

              {!loading && !loadError && (
                <p role="status" className="text-sm text-slate-500">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1
                    ? 'device'
                    : 'devices'}{' '}
                  to explore
                </p>
              )}
            </div>

            <div className="af-catalogue-toolbar mt-8">
              <div className="flex-1">
                <label
                  htmlFor="product-search"
                  className="sr-only"
                >
                  Search products
                </label>

                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  >
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m16 16 4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="product-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="What are you looking for?"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm focus:border-blue-500 focus:outline-2 focus:outline-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-sort"
                  className="sr-only"
                >
                  Sort products
                </label>

                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) => {
                    const value = event.target.value

                    if (
                      value === 'default' ||
                      value === 'price-asc' ||
                      value === 'price-desc'
                    ) {
                      setSortOrder(value)
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-600 focus:outline-2 focus:outline-blue-500 sm:w-52"
                >
                  <option value="default">Sort: Latest added</option>
                  <option value="price-asc">
                    Price: Low to high
                  </option>
                  <option value="price-desc">
                    Price: High to low
                  </option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Clear filters ×
              </button>
            )}

            {loading ? (
              <div
                role="status"
                aria-label="Loading products"
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    aria-hidden="true"
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="af-skeleton aspect-square rounded-xl" />
                    <div className="af-skeleton mt-5 h-3 w-1/3 rounded" />
                    <div className="af-skeleton mt-3 h-5 w-4/5 rounded" />
                    <div className="af-skeleton mt-4 h-5 w-1/2 rounded" />
                    <div className="af-skeleton mt-6 h-11 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="af-empty-state mt-8">
                <p role="alert" className="text-red-700">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() => void refreshProducts()}
                  className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="af-product-grid mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="af-product-entry"
                    style={{
                      animationDelay: `${Math.min(index, 5) * 60}ms`,
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="af-empty-state mt-8">
                <span
                  aria-hidden="true"
                  className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700"
                >
                  ↗
                </span>

                <h3 className="text-xl font-semibold tracking-tight">
                  {products.length === 0
                    ? 'Your next device could be a chat away.'
                    : 'No matches just yet.'}
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                  {products.length === 0
                    ? 'Contact AfeTech to ask about current device availability.'
                    : 'Try another search or select a different category.'}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </section>

          <section
            id="contact"
            aria-labelledby="contact-heading"
            className="af-contact-panel mb-16 scroll-mt-36 sm:mb-24"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                LET’S TALK TECH
              </p>

              <h2
                id="contact-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Not sure what to choose?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Tell us what you need and your budget. Ask
                about specifications, availability, and delivery
                before placing your order.
              </p>
            </div>

            <a
              href={`https://wa.me/${store.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="af-primary-action shrink-0"
            >
              Chat with AfeTech
              <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}