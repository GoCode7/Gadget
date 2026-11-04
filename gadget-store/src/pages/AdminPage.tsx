import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import ProductForm from '../components/ProductForm'
import EditProductForm from '../components/EditProductForm'
import { useProducts } from '../context/ProductsContext'
import { store } from '../data/store'
import type { Product } from '../types/product'

const priceFormatter = new Intl.NumberFormat(store.locale, {
  style: 'currency',
  currency: store.currency,
})

const inputClass =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

const secondaryButton =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50'

export default function AdminPage() {
  const {
    products,
    loading,
    loadError,
    refreshProducts,
    updateAvailability,
  } = useProducts()

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  const updateInProgress = useRef(false)
  const editHeadingRef = useRef<HTMLHeadingElement>(null)
  const lastEditButtonRef = useRef<HTMLButtonElement | null>(null)
  const addProductDialogRef = useRef<HTMLDialogElement>(null)
  const addProductButtonRef = useRef<HTMLButtonElement>(null)

  const inventoryBusy =
    loading ||
    updatingId !== null ||
    editingProduct !== null ||
    isAddProductOpen

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort()

  const inStockCount = products.filter(
    (product) => product.availability === 'In stock',
  ).length

  const query = search.trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !query ||
      [
        product.name,
        product.brand,
        product.category,
        product.condition,
      ].some((value) => value.toLowerCase().includes(query))

    return (
      matchesSearch &&
      (category === 'all' || product.category === category) &&
      (availability === 'all' ||
        product.availability === availability)
    )
  })

  const hasFilters =
    search !== '' || category !== 'all' || availability !== 'all'

  const stats = [
    {
      label: 'Published products',
      value: products.length,
      detail: 'Your complete catalogue',
    },
    {
      label: 'In stock',
      value: inStockCount,
      detail: 'Available for enquiries',
    },
    {
      label: 'Out of stock',
      value: products.length - inStockCount,
      detail: 'Currently unavailable',
    },
    {
      label: 'Categories',
      value: categories.length,
      detail: 'Across published products',
    },
  ]

  useEffect(() => {
    const dialog = addProductDialogRef.current
    if (!dialog) return

    if (isAddProductOpen) {
      if (!dialog.open) dialog.showModal()

      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = previousOverflow
      }
    }

    if (dialog.open) {
      dialog.close()
    }
  }, [isAddProductOpen])

  function openAddProduct() {
    if (editingProduct || updatingId || updateInProgress.current) {
      return
    }

    setIsAddProductOpen(true)
  }

  function closeAddProduct() {
    // ProductForm marks its form busy during publishing.
    const isPublishing = addProductDialogRef.current?.querySelector(
      '[aria-busy="true"]',
    )

    if (isPublishing) return

    // Close before unmounting the form so focus leaves the dialog first.
    addProductDialogRef.current?.close()
    setIsAddProductOpen(false)
    addProductButtonRef.current?.focus({ preventScroll: true })
  }

  function clearFilters() {
    setSearch('')
    setCategory('all')
    setAvailability('all')
  }

  async function handleRefresh() {
    if (inventoryBusy || updateInProgress.current) return

    setActionError('')
    setActionMessage('')

    try {
      await refreshProducts()
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Inventory could not be refreshed.',
      )
    }
  }

  async function handleAvailabilityChange(product: Product) {
    if (inventoryBusy || updateInProgress.current) return

    const nextAvailability: Product['availability'] =
      product.availability === 'In stock'
        ? 'Out of stock'
        : 'In stock'

    updateInProgress.current = true
    setUpdatingId(product.id)
    setActionError('')
    setActionMessage('')

    try {
      await updateAvailability(product.id, nextAvailability)

      setActionMessage(
        `${product.name} is now marked ${nextAvailability.toLowerCase()}.`,
      )
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Availability could not be updated.',
      )
    } finally {
      updateInProgress.current = false
      setUpdatingId(null)
    }
  }

  function handleEdit(
    product: Product,
    button: HTMLButtonElement,
  ) {
    if (inventoryBusy || updateInProgress.current) return

    lastEditButtonRef.current = button
    setActionError('')
    setActionMessage('')
    setEditingProduct(product)

    window.requestAnimationFrame(() => {
      editHeadingRef.current?.focus()
    })
  }

  function handleEditClose() {
    setEditingProduct(null)

    window.requestAnimationFrame(() => {
      const button = lastEditButtonRef.current

      if (button?.isConnected && !button.disabled) {
        button.focus({ preventScroll: true })
      } else {
        document.getElementById('inventory-heading')?.focus()
      }
    })
  }

  function handleEditSaved(message: string) {
    setActionError('')
    setActionMessage(message)
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900">
      <a
        href="#admin-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-white px-4 py-3 font-semibold text-blue-700 shadow-lg focus:not-sr-only"
      >
        Skip to dashboard
      </a>

      <header className="border-b border-white/10 bg-[#0b1739] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black"
            >
              A
            </span>

            <span>
              <span className="block text-xl font-extrabold tracking-tight">
                {store.name}
              </span>
              <span className="block text-xs text-slate-400">
                Administration
              </span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            View storefront
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <main
        id="admin-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6 lg:px-8 lg:py-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Store overview
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0b1739] sm:text-4xl">
              Your store, at a glance.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Manage your catalogue, keep availability current,
              and prepare your next product listing.
            </p>
          </div>

          <button
            ref={addProductButtonRef}
            type="button"
            onClick={openAddProduct}
            disabled={editingProduct !== null || updatingId !== null}
            aria-haspopup="dialog"
            aria-controls="add-product-dialog"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true" className="text-lg">
              +
            </span>
            Add a product
          </button>
        </div>

        <section
          aria-label="Inventory summary"
          className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"
            >
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                {stat.label}
              </p>

              <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#0b1739]">
                {loading || loadError ? '—' : stat.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {stat.detail}
              </p>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="inventory-heading"
          className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(11,23,57,0.2)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <h2
                id="inventory-heading"
                tabIndex={-1}
                className="rounded text-xl font-bold tracking-tight text-[#0b1739] focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Published inventory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review listings and manage stock availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={inventoryBusy}
              className={secondaryButton}
            >
              {loading ? 'Refreshing…' : 'Refresh inventory'}
            </button>
          </div>

          <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label
                htmlFor="inventory-search"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Search products
              </label>

              <input
                id="inventory-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, brand, or condition…"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="inventory-category"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Category
              </label>

              <select
                id="inventory-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="inventory-availability"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Availability
              </label>

              <select
                id="inventory-availability"
                value={availability}
                onChange={(event) =>
                  setAvailability(event.target.value)
                }
                className={inputClass}
              >
                <option value="all">All stock statuses</option>
                <option value="In stock">In stock</option>
                <option value="Out of stock">Out of stock</option>
              </select>
            </div>
          </div>

          {actionError && (
            <p
              role="alert"
              className="mx-5 mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 sm:mx-6"
            >
              {actionError}
            </p>
          )}

          {actionMessage && (
            <p
              role="status"
              className="mx-5 mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800 sm:mx-6"
            >
              {actionMessage}
            </p>
          )}

          {editingProduct && (
            <div className="mx-5 mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800 sm:mx-6">
              Editing <strong>{editingProduct.name}</strong>.
              Save or cancel below before changing another listing.{' '}
              <a
                href="#edit-product"
                className="rounded font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Go to edit form
              </a>
            </div>
          )}

          {loading ? (
            <div role="status" className="px-6 py-16 text-center">
              <span
                aria-hidden="true"
                className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600 motion-reduce:animate-none"
              />
              <p className="mt-4 text-sm text-slate-500">
                Loading inventory…
              </p>
            </div>
          ) : loadError ? (
            <div className="p-6">
              <p role="alert" className="text-sm text-red-700">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={inventoryBusy}
                className={`mt-4 ${secondaryButton}`}
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-bold text-[#0b1739]">
                Your catalogue starts here.
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Click “Add a product” to prepare your first listing.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <p role="status" className="text-xs text-slate-500">
                  Showing {filteredProducts.length} of{' '}
                  {products.length} products
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <h3 className="font-bold text-[#0b1739]">
                    No matching products
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try another search or clear your filters.
                  </p>
                </div>
              ) : (
                <div
                  role="region"
                  aria-label="Published product inventory"
                  tabIndex={0}
                  className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <table className="w-full min-w-[960px] text-left text-sm">
                    <caption className="sr-only">
                      Published products with editing and
                      availability controls
                    </caption>

                    <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        {[
                          'Product',
                          'Category',
                          'Price',
                          'Availability',
                          'Actions',
                        ].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-6 py-4 font-semibold"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition-colors hover:bg-blue-50/30"
                        >
                          <th
                            scope="row"
                            className="px-6 py-5 font-semibold text-[#0b1739]"
                          >
                            <span className="block">
                              {product.name}
                            </span>

                            <span className="mt-1 block text-xs font-normal text-slate-500">
                              {product.brand} · {product.condition}
                            </span>
                          </th>

                          <td className="px-6 py-5">
                            <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                              {product.category}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 font-semibold text-[#0b1739]">
                            {priceFormatter.format(
                              product.priceInKobo / 100,
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                                product.availability === 'In stock'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`h-1.5 w-1.5 rounded-full ${
                                  product.availability === 'In stock'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {product.availability}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={inventoryBusy}
                                onClick={(event) =>
                                  handleEdit(
                                    product,
                                    event.currentTarget,
                                  )
                                }
                                aria-label={`Edit ${product.name}`}
                                className="min-h-11 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={inventoryBusy}
                                onClick={() =>
                                  void handleAvailabilityChange(product)
                                }
                                aria-label={`Mark ${product.name} as ${
                                  product.availability === 'In stock'
                                    ? 'out of stock'
                                    : 'in stock'
                                }`}
                                className={`${secondaryButton} whitespace-nowrap text-xs`}
                              >
                                {updatingId === product.id
                                  ? 'Updating…'
                                  : product.availability === 'In stock'
                                    ? 'Mark out of stock'
                                    : 'Mark in stock'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        {editingProduct && (
          <section
            id="edit-product"
            aria-labelledby="edit-product-heading"
            className="mt-8 scroll-mt-6"
          >
            <h2
              ref={editHeadingRef}
              id="edit-product-heading"
              tabIndex={-1}
              className="mb-5 rounded text-xl font-bold text-[#0b1739] focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Edit product
            </h2>

            <EditProductForm
              key={editingProduct.id}
              product={editingProduct}
              onClose={handleEditClose}
              onSaved={handleEditSaved}
            />
          </section>
        )}

        <dialog
          ref={addProductDialogRef}
          id="add-product-dialog"
          aria-labelledby="add-product-dialog-heading"
          aria-describedby="add-product-dialog-description"
          onCancel={(event) => {
            event.preventDefault()
            closeAddProduct()
          }}
          className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto overscroll-contain rounded-3xl border-0 bg-[#f4f7fc] p-0 text-slate-900 shadow-2xl backdrop:bg-[#0b1739]/70 backdrop:backdrop-blur-sm"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Grow your catalogue
              </p>

              <h2
                id="add-product-dialog-heading"
                className="mt-1 text-xl font-extrabold tracking-tight text-[#0b1739]"
              >
                Add a product
              </h2>

              <p
                id="add-product-dialog-description"
                className="mt-1 text-xs leading-6 text-slate-500"
              >
                Review before publishing. Closing clears the unsaved draft.
              </p>
            </div>

            <button
              type="button"
              onClick={closeAddProduct}
              aria-label="Close add product"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="p-3 sm:p-6">
            {isAddProductOpen && <ProductForm />}
          </div>
        </dialog>

        <footer className="mt-12 border-t border-slate-200 py-6 text-xs text-slate-400">
          © {new Date().getFullYear()} {store.name} · Admin workspace
        </footer>
      </main>
    </div>
  )
}