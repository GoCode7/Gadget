import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Product } from '../types/product'
import { useProducts } from '../context/ProductsContext'

type EditProductFormProps = {
  product: Product
  onClose: () => void
  onSaved: (message: string) => void
}

const inputClassName =
  'mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10'

const labelClassName =
  'block text-sm font-semibold text-slate-700'

export default function EditProductForm({
  product,
  onClose,
  onSaved,
}: EditProductFormProps) {
  const { updateProduct } = useProducts()

  const [name, setName] = useState(product.name)
  const [brand, setBrand] = useState(product.brand)
  const [description, setDescription] = useState(product.description)

  const [price, setPrice] = useState(
    `${Math.floor(product.priceInKobo / 100)}.${String(
      product.priceInKobo % 100,
    ).padStart(2, '0')}`,
  )

  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const savingRef = useRef(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (savingRef.current) return

    setErrorMessage('')

    if (!name.trim() || !brand.trim() || !description.trim()) {
      setErrorMessage(
        'Name, brand, and description cannot contain only spaces.',
      )
      return
    }

    const priceText = price.trim()

    if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
      setErrorMessage(
        'Enter a valid price with up to two decimal places.',
      )
      return
    }

    const [wholeNaira, fractionalKobo = ''] = priceText.split('.')

    const priceInKobo =
      Number(wholeNaira) * 100 +
      Number(fractionalKobo.padEnd(2, '0'))

    if (!Number.isSafeInteger(priceInKobo) || priceInKobo <= 0) {
      setErrorMessage('Enter a valid price greater than zero.')
      return
    }

    savingRef.current = true
    setIsSaving(true)

    try {
      await updateProduct(product.id, {
        name: name.trim(),
        brand: brand.trim(),
        description: description.trim(),
        priceInKobo,
        category: product.category,
        condition: product.condition,
        specifications: product.specifications,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update the product.',
      )
      return
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }

    onSaved(`${name.trim()} was updated successfully.`)
    onClose()
  }

  return (
    <section
      aria-labelledby="edit-form-heading"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_-28px_rgba(11,23,57,0.2)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-6 sm:px-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Update listing
          </p>

          <h3
            id="edit-form-heading"
            className="mt-2 break-words text-xl font-bold tracking-tight text-[#0b1739]"
          >
            {product.name}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Update the details below. Saving changes updates
            the published listing immediately.
          </p>
        </div>

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
      </div>

      <form
        onSubmit={handleSubmit}
        onChange={() => setErrorMessage('')}
        aria-busy={isSaving}
        className="p-5 sm:p-8"
      >
        <fieldset
          disabled={isSaving}
          className="grid min-w-0 gap-8 disabled:opacity-60 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
        >
          <legend className="sr-only">
            Edit product information
          </legend>

          <div className="min-w-0">
            <h4 className="mb-5 font-bold text-[#0b1739]">
              Product information
            </h4>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-product-name"
                  className={labelClassName}
                >
                  Product name *
                </label>

                <input
                  id="edit-product-name"
                  name="name"
                  type="text"
                  required
                  maxLength={150}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-brand"
                  className={labelClassName}
                >
                  Brand *
                </label>

                <input
                  id="edit-product-brand"
                  name="brand"
                  type="text"
                  required
                  maxLength={80}
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-product-price"
                  className={labelClassName}
                >
                  Price in naira (₦) *
                </label>

                <input
                  id="edit-product-price"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  required
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-product-description"
                  className={labelClassName}
                >
                  Description *
                </label>

                <textarea
                  id="edit-product-description"
                  name="description"
                  required
                  maxLength={5000}
                  rows={7}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className={`${inputClassName} resize-y`}
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {description.length.toLocaleString()} / 5,000
                </p>
              </div>
            </div>
          </div>

          <aside
            aria-labelledby="edit-summary-heading"
            className="min-w-0 self-start rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
          >
            <h4
              id="edit-summary-heading"
              className="font-bold text-[#0b1739]"
            >
              Current listing
            </h4>

            {product.images[0] && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-full object-contain p-5"
                />
              </div>
            )}

            <dl className="mt-5 divide-y divide-slate-200">
              <div className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-semibold text-slate-800">
                  {product.category}
                </dd>
              </div>

              <div className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                <dt className="text-slate-500">Condition</dt>
                <dd className="font-semibold text-slate-800">
                  {product.condition}
                </dd>
              </div>

              {Object.entries(product.specifications).map(
                ([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap justify-between gap-3 py-3 text-sm"
                  >
                    <dt className="break-words text-slate-500">
                      {label}
                    </dt>
                    <dd className="break-words font-semibold text-slate-800">
                      {value}
                    </dd>
                  </div>
                ),
              )}
            </dl>

            <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
              You’re editing the name, brand, price, and description.
              Manage stock availability from the inventory table.
            </p>
          </aside>

          <div className="border-t border-slate-100 pt-6 lg:col-span-2">
            {errorMessage && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                {errorMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs leading-6 text-slate-500">
                Fields marked * are required.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  {isSaving && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                    />
                  )}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>

            {isSaving && (
              <p
                role="status"
                className="mt-4 text-sm text-slate-500"
              >
                Updating the published listing…
              </p>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  )
}