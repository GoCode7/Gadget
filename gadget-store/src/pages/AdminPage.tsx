import { useRef, useState } from 'react'
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

  const [updatingId, setUpdatingId] =
    useState<string | null>(null)

  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const updateInProgress = useRef(false)

  const inventoryBusy =
    loading ||
    updatingId !== null ||
    editingProduct !== null

  async function handleAvailabilityChange(product: Product) {
    if (
      updateInProgress.current ||
      editingProduct !== null
    ) {
      return
    }

    const nextAvailability: Product['availability'] =
      product.availability === 'In stock'
        ? 'Out of stock'
        : 'In stock'

    updateInProgress.current = true
    setUpdatingId(product.id)
    setActionError('')
    setActionMessage('')

    try {
      await updateAvailability(
        product.id,
        nextAvailability,
      )

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

  function handleEdit(product: Product) {
    if (inventoryBusy) return

    setActionError('')
    setActionMessage('')
    setEditingProduct(product)
  }

  function handleEditSaved(message: string) {
    setActionError('')
    setActionMessage(message)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            to="/"
            className="rounded text-2xl font-extrabold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {store.name}
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            View storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage products
        </h1>

        <p className="mt-3 text-slate-600">
          Review published products, edit their details,
          update availability, and create new listings.
        </p>

        <section
          aria-labelledby="inventory-heading"
          className="my-10 overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
            <div>
              <h2
                id="inventory-heading"
                className="text-xl font-bold"
              >
                Published inventory
              </h2>

              {!loading && !loadError && (
                <p className="mt-1 text-sm text-slate-600">
                  {products.length}{' '}
                  {products.length === 1
                    ? 'product'
                    : 'products'}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError('')
                  setActionMessage('')
                  void refreshProducts()
                }}
                disabled={inventoryBusy}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Refreshing…' : 'Refresh inventory'}
              </button>

              {!editingProduct && (
                <a
                  href="#add-product"
                  className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  Add a product
                </a>
              )}
            </div>
          </div>

          {actionError && (
            <p
              role="alert"
              className="mx-6 mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800"
            >
              {actionError}
            </p>
          )}

          {actionMessage && (
            <p
              role="status"
              className="mx-6 mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800"
            >
              {actionMessage}
            </p>
          )}

          {editingProduct && (
            <p className="mx-6 mt-6 text-sm text-slate-600">
              The edit form is below the inventory. Save or
              cancel your changes before editing another
              product.
            </p>
          )}

          {loading ? (
            <p role="status" className="p-6 text-slate-600">
              Loading inventory…
            </p>
          ) : loadError ? (
            <div className="p-6">
              <p role="alert" className="text-red-700">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => void refreshProducts()}
                disabled={inventoryBusy}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h3 className="font-semibold">
                No published products yet
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Complete the form below to publish your first
                product.
              </p>
            </div>
          ) : (
            <div
              role="region"
              aria-label="Published product inventory"
              tabIndex={0}
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <table className="w-full min-w-[900px] text-left text-sm">
                <caption className="sr-only">
                  Published products with editing and
                  availability controls
                </caption>

                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Product
                    </th>

                    <th scope="col" className="px-6 py-4">
                      Category
                    </th>

                    <th scope="col" className="px-6 py-4">
                      Price
                    </th>

                    <th scope="col" className="px-6 py-4">
                      Availability
                    </th>

                    <th scope="col" className="px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium"
                      >
                        <span className="block">
                          {product.name}
                        </span>

                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          {product.brand} · {product.condition}
                        </span>
                      </th>

                      <td className="px-6 py-4">
                        {product.category}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        {priceFormatter.format(
                          product.priceInKobo / 100,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                            product.availability === 'In stock'
                              ? 'bg-green-50 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {product.availability}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={inventoryBusy}
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="rounded-lg border border-blue-200 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={inventoryBusy}
                            onClick={() =>
                              void handleAvailabilityChange(
                                product,
                              )
                            }
                            aria-label={`Mark ${product.name} as ${
                              product.availability === 'In stock'
                                ? 'out of stock'
                                : 'in stock'
                            }`}
                            className="whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
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
        </section>

        {editingProduct && (
          <div className="mb-10">
            <EditProductForm
              key={editingProduct.id}
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onSaved={handleEditSaved}
            />
          </div>
        )}

        <div
          id="add-product"
          hidden={editingProduct !== null}
          className="scroll-mt-6"
        >
          <ProductForm />
        </div>
      </main>
    </div>
  )
}