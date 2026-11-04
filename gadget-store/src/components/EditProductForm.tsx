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
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600'

export default function EditProductForm({
  product,
  onClose,
  onSaved,
}: EditProductFormProps) {
  const { updateProduct } = useProducts()

  const [name, setName] = useState(product.name)
  const [brand, setBrand] = useState(product.brand)
  const [description, setDescription] =
    useState(product.description)

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

    const [wholeNaira, fractionalKobo = ''] =
      priceText.split('.')

    const priceInKobo =
      Number(wholeNaira) * 100 +
      Number(fractionalKobo.padEnd(2, '0'))

    if (
      !Number.isSafeInteger(priceInKobo) ||
      priceInKobo <= 0
    ) {
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
      })

      onSaved(`${name.trim()} was updated successfully.`)
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update the product.',
      )
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <section
      aria-labelledby="edit-product-heading"
      className="rounded-xl border border-blue-200 bg-white p-6"
    >
      <h2
        id="edit-product-heading"
        className="text-2xl font-bold"
      >
        Edit product
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Saving updates the published listing immediately.
      </p>

      <form
        onSubmit={handleSubmit}
        onChange={() => setErrorMessage('')}
        aria-busy={isSaving}
        className="mt-6"
      >
        <fieldset
          disabled={isSaving}
          className="grid min-w-0 gap-5 sm:grid-cols-2 disabled:opacity-60"
        >
          <legend className="sr-only">
            Edit product information
          </legend>

          <div>
            <label
              htmlFor="edit-product-name"
              className="text-sm font-medium"
            >
              Product name
            </label>

            <input
              id="edit-product-name"
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
              className="text-sm font-medium"
            >
              Brand
            </label>

            <input
              id="edit-product-brand"
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
              className="text-sm font-medium"
            >
              Price in naira (₦)
            </label>

            <input
              id="edit-product-price"
              type="number"
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
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="edit-product-description"
              required
              maxLength={5000}
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className={inputClassName}
            />
          </div>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </fieldset>

        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  )
}