import { useRef } from 'react'
import { useSearchParams } from 'react-router'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/ProductCard'
import { BackToTop } from '../components/BackToTop'
import { categories } from '../data/categories'
import { useProducts } from '../context/ProductsContext'

const PAGE_SIZE = 12

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

const pageButtonClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40'

export default function ShopPage() {
  const { products, loading, loadError, refreshProducts } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const searchQuery = searchParams.get('q') ?? ''
  const categoryParam = searchParams.get('category')
  const sortParam = searchParams.get('sort')

  const selectedCategory =
    categories.find((category) => category === categoryParam) ?? 'All'

  const sortOrder =
    sortParam === 'price-asc' || sortParam === 'price-desc'
      ? sortParam
      : 'default'

  const pageText = searchParams.get('page') ?? '1'
  const pageNumber = /^\d+$/.test(pageText) ? Number(pageText) : 1

  const requestedPage =
    Number.isSafeInteger(pageNumber) && pageNumber > 0
      ? pageNumber
      : 1

  const query = searchQuery.trim().toLowerCase()

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

    return matchesCategory && searchableText.includes(query)
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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / PAGE_SIZE),
  )
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleProducts = sortedProducts.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  )

  // Keep pagination compact even for a large catalogue.
  const firstPageNumber = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4),
  )
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPageNumber + index,
  )

  const hasFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    sortOrder !== 'default'

  function updateFilter(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (!value || value === 'All' || value === 'default') {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(searchParams)
    ;['q', 'category', 'sort', 'page'].forEach((key) => {
      nextParams.delete(key)
    })
    setSearchParams(nextParams, { replace: true })
  }

  function changePage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return

    const nextParams = new URLSearchParams(searchParams)

    if (page === 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(page))
    }

    setSearchParams(nextParams)

    window.requestAnimationFrame(() => {
      resultsHeadingRef.current?.focus({ preventScroll: true })
      resultsHeadingRef.current?.scrollIntoView({
        block: 'start',
        behavior: 'instant',
      })
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Header />

      <main id="main-content" tabIndex={-1}>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <section
            aria-label="Filter products"
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          >
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
              <div>
                <label
                  htmlFor="shop-search"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Search products
                </label>
                <input
                  id="shop-search"
                  type="search"
                  placeholder="Search devices, brands, or features…"
                  value={searchQuery}
                  onChange={(event) =>
                    updateFilter('q', event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="shop-category"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Category
                </label>
                <select
                  id="shop-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    updateFilter('category', event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shop-sort"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sortOrder}
                  onChange={(event) =>
                    updateFilter('sort', event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="default">Default order</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                Clear filters ×
              </button>
            )}
          </section>

          <section aria-labelledby="shop-results-heading" className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                ref={resultsHeadingRef}
                id="shop-results-heading"
                tabIndex={-1}
                className="scroll-mt-40 rounded text-2xl font-bold tracking-tight text-[#0b1739] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                {selectedCategory === 'All'
                  ? 'All products'
                  : selectedCategory}
              </h2>

              {!loading && !loadError && (
                <p role="status" className="text-sm text-slate-500">
                  {sortedProducts.length > 0
                    ? `Showing ${startIndex + 1}–${Math.min(
                        startIndex + PAGE_SIZE,
                        sortedProducts.length,
                      )} of ${sortedProducts.length} products`
                    : '0 products found'}
                </p>
              )}
            </div>

            {loading ? (
              <div
                role="status"
                aria-label="Loading products"
                className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="af-skeleton aspect-square rounded-xl" />
                    <div className="af-skeleton mt-5 h-5 w-4/5 rounded" />
                    <div className="af-skeleton mt-4 h-5 w-1/2 rounded" />
                    <div className="af-skeleton mt-6 h-11 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="af-empty-state mt-7">
                <p role="alert" className="text-red-700">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void refreshProducts().catch(() => undefined)
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  Try again
                </button>
              </div>
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="af-product-grid mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 border-t border-slate-200 pt-7">
                    <p className="mb-4 text-center text-xs text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>

                    <nav
                      aria-label="Product pagination"
                      className="flex flex-wrap items-center justify-center gap-2"
                    >
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                        className={`${pageButtonClass} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
                      >
                        Previous
                      </button>

                      {firstPageNumber > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Go to page 1"
                            onClick={() => changePage(1)}
                            className={`${pageButtonClass} border-slate-200 bg-white text-slate-600`}
                          >
                            1
                          </button>
                          {firstPageNumber > 2 && (
                            <span aria-hidden="true" className="px-1 text-slate-400">
                              …
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          type="button"
                          aria-label={`Go to page ${page}`}
                          aria-current={
                            currentPage === page ? 'page' : undefined
                          }
                          onClick={() => changePage(page)}
                          className={`${pageButtonClass} ${
                            currentPage === page
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                          {pageNumbers[pageNumbers.length - 1] <
                            totalPages - 1 && (
                            <span aria-hidden="true" className="px-1 text-slate-400">
                              …
                            </span>
                          )}
                          <button
                            type="button"
                            aria-label={`Go to page ${totalPages}`}
                            onClick={() => changePage(totalPages)}
                            className={`${pageButtonClass} border-slate-200 bg-white text-slate-600`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => changePage(currentPage + 1)}
                        className={`${pageButtonClass} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="af-empty-state mt-7">
                <h3 className="text-xl font-semibold text-[#0b1739]">
                  {products.length === 0
                    ? 'The collection is being updated.'
                    : 'No matching products.'}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {products.length === 0
                    ? 'Please check back soon for available devices.'
                    : 'Try another search or choose a different category.'}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}