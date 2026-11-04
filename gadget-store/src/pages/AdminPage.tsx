import { Link } from 'react-router'
import ProductForm from '../components/ProductForm'
import { useProducts } from '../context/ProductsContext'
import { store } from '../data/store'

const priceFormatter = new Intl.NumberFormat(store.locale, {
  style: 'currency',
  currency: store.currency,
})

export default function AdminPage() {
  const { products } = useProducts()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            to="/"
            className="text-2xl font-extrabold text-blue-700"
          >
            {store.name}
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
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
          Review your inventory and prepare product listings.
        </p>

        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          Frontend development: products are held in this tab’s
          memory and disappear on refresh. Admin authentication
          is not connected yet.
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
                Product inventory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {products.length}{' '}
                {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <a
              href="#add-product"
              className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Add a product
            </a>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h3 className="font-semibold">
                Your inventory is empty
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Use the form below to add your first product
                for this session.
              </p>
            </div>
          ) : (
            <div
              role="region"
              aria-label="Product inventory"
              tabIndex={0}
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">
                  Product names, categories, prices, and
                  availability
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
                        {product.availability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div id="add-product" className="scroll-mt-6">
          <ProductForm />
        </div>
      </main>
    </div>
  )
}