import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { categories } from '../data/categories'
import { useProducts } from '../context/ProductsContext'
import type {
  Product,
  ProductCategory,
  ProductCondition,
} from '../types/product'
import ProductCard from './ProductCard'

type ProductFormValues = {
  name: string
  brand: string
  category: ProductCategory
  condition: ProductCondition
  price: string
  description: string
  availability: Product['availability']
  storage: string
  colour: string
}

type SelectedImage = {
  file: File
  previewUrl: string
}

const initialValues: ProductFormValues = {
  name: '',
  brand: '',
  category: 'Phones',
  condition: 'New',
  price: '',
  description: '',
  availability: 'In stock',
  storage: '',
  colour: '',
}

const inputClassName =
  'mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

const labelClassName = 'block text-sm font-semibold text-slate-700'

export default function ProductForm() {
  const { addProduct } = useProducts()
  const [values, setValues] = useState<ProductFormValues>({
    ...initialValues,
  })
  const [selectedImage, setSelectedImage] =
    useState<SelectedImage | null>(null)
  const [reviewProduct, setReviewProduct] =
    useState<Product | null>(null)
  const [imageError, setImageError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!selectedImage) return

    const previewUrl = selectedImage.previewUrl
    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImage])

  function clearFeedback() {
    setFormError('')
    setSuccessMessage('')
    setReviewProduct(null)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    clearFeedback()

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Choose a JPG, PNG, or WebP image.')
      return
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setImageError(
        'Choose a non-empty image that is 5 MB or smaller.',
      )
      return
    }

    setImageError('')
    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    })
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingRef.current) return

    clearFeedback()

    if (
      !values.name.trim() ||
      !values.brand.trim() ||
      !values.description.trim()
    ) {
      setFormError(
        'Enter a product name, brand, and description. These cannot contain only spaces.',
      )
      return
    }

    const priceText = values.price.trim()
    if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
      setFormError('Enter a valid price with up to two decimal places.')
      return
    }

    const [wholeNaira, fractionalKobo = ''] = priceText.split('.')
    const priceInKobo =
      Number(wholeNaira) * 100 +
      Number(fractionalKobo.padEnd(2, '0'))

    if (!Number.isSafeInteger(priceInKobo) || priceInKobo <= 0) {
      setFormError('Enter a valid price greater than zero.')
      return
    }

    if (imageError) {
      setFormError('Resolve the photo error before reviewing.')
      return
    }

    if (!selectedImage) {
      setFormError('Select a product photo.')
      return
    }

    const specifications: Record<string, string> = {}
    if (values.storage.trim()) {
      specifications.Storage = values.storage.trim()
    }
    if (values.colour.trim()) {
      specifications.Colour = values.colour.trim()
    }

    setReviewProduct({
      id: 'admin-preview',
      slug: 'admin-preview',
      name: values.name.trim(),
      brand: values.brand.trim(),
      category: values.category,
      condition: values.condition,
      description: values.description.trim(),
      priceInKobo,
      availability: values.availability,
      specifications,
      images: [selectedImage.previewUrl],
    })
  }

  async function handlePublish() {
    if (!reviewProduct || !selectedImage || savingRef.current) return

    savingRef.current = true
    setIsSaving(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await addProduct(
        {
          name: reviewProduct.name,
          brand: reviewProduct.brand,
          category: reviewProduct.category,
          condition: reviewProduct.condition,
          description: reviewProduct.description,
          priceInKobo: reviewProduct.priceInKobo,
          availability: reviewProduct.availability,
          specifications: reviewProduct.specifications,
        },
        selectedImage.file,
      )

      setValues({ ...initialValues })
      setSelectedImage(null)
      setReviewProduct(null)
      setImageError('')
      setSuccessMessage('Product saved and published successfully.')
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the product. Please try again.',
      )
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <section
      aria-labelledby="product-form-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <h2
        id="product-form-heading"
        className="text-2xl font-bold text-[#0b1739]"
      >
        Product details
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Complete the details, review the card, then publish. Fields marked
        * are required.
      </p>

      <form
        onSubmit={handleReview}
        onChange={clearFeedback}
        aria-busy={isSaving}
        className="mt-6"
      >
        <fieldset
          disabled={isSaving}
          className="grid min-w-0 gap-5 sm:grid-cols-2 disabled:opacity-60"
        >
          <legend className="sr-only">Product information</legend>

          <div>
            <label htmlFor="product-name" className={labelClassName}>
              Product name *
            </label>
            <input
              id="product-name"
              type="text"
              required
              maxLength={150}
              placeholder="e.g. Samsung Galaxy S24"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="product-brand" className={labelClassName}>
              Brand *
            </label>
            <input
              id="product-brand"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Samsung"
              value={values.brand}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  brand: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="product-category" className={labelClassName}>
              Category *
            </label>
            <select
              id="product-category"
              value={values.category}
              onChange={(event) => {
                const category = categories.find(
                  (item) => item === event.target.value,
                )
                if (category) {
                  setValues((current) => ({ ...current, category }))
                }
              }}
              className={inputClassName}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-condition" className={labelClassName}>
              Condition *
            </label>
            <select
              id="product-condition"
              value={values.condition}
              onChange={(event) => {
                const condition = event.target.value
                if (
                  condition === 'New' ||
                  condition === 'Used' ||
                  condition === 'Refurbished'
                ) {
                  setValues((current) => ({ ...current, condition }))
                }
              }}
              className={inputClassName}
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-price" className={labelClassName}>
              Price in naira (₦) *
            </label>
            <input
              id="product-price"
              type="number"
              inputMode="decimal"
              required
              min="0.01"
              step="0.01"
              value={values.price}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="product-availability" className={labelClassName}>
              Availability *
            </label>
            <select
              id="product-availability"
              value={values.availability}
              onChange={(event) => {
                const availability = event.target.value
                if (
                  availability === 'In stock' ||
                  availability === 'Out of stock'
                ) {
                  setValues((current) => ({
                    ...current,
                    availability,
                  }))
                }
              }}
              className={inputClassName}
            >
              <option value="In stock">In stock</option>
              <option value="Out of stock">Out of stock</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-storage" className={labelClassName}>
              Storage capacity
            </label>
            <input
              id="product-storage"
              type="text"
              maxLength={80}
              placeholder="e.g. 256 GB"
              value={values.storage}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  storage: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="product-colour" className={labelClassName}>
              Colour
            </label>
            <input
              id="product-colour"
              type="text"
              maxLength={80}
              placeholder="e.g. Black"
              value={values.colour}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  colour: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-description" className={labelClassName}>
              Description *
            </label>
            <textarea
              id="product-description"
              required
              maxLength={5000}
              rows={5}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className={`${inputClassName} resize-y`}
            />
            <p className="mt-2 text-right text-xs text-slate-400">
              {values.description.length.toLocaleString()} / 5,000
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-photo" className={labelClassName}>
              Product photo *
            </label>
            <p id="product-photo-help" className="mt-1 text-xs text-slate-500">
              JPG, PNG, or WebP, up to 5 MB.
            </p>
            <input
              id="product-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              aria-invalid={Boolean(imageError)}
              aria-describedby={
                imageError ? 'product-photo-help product-photo-error' : 'product-photo-help'
              }
              className="mt-3 block w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
            />
            {imageError && (
              <p
                id="product-photo-error"
                role="alert"
                className="mt-2 text-sm text-red-700"
              >
                {imageError}
              </p>
            )}
            {selectedImage && (
              <p className="mt-2 text-xs text-slate-500">
                Selected: {selectedImage.file.name}
              </p>
            )}
          </div>
        </fieldset>

        {formError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800"
          >
            {formError}
          </p>
        )}
        {successMessage && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {successMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p className="text-xs leading-5 text-slate-500">
            Review the product card before publishing it to the store.
          </p>
          <div className="flex flex-wrap gap-3">
            {reviewProduct && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="min-h-11 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Publishing…' : 'Publish product'}
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Review product
            </button>
          </div>
        </div>
        {isSaving && (
          <p role="status" className="mt-4 text-sm text-slate-500">
            Uploading the photo and publishing the product…
          </p>
        )}
      </form>

      {reviewProduct && (
        <section
          aria-labelledby="product-review-heading"
          className="mt-8 border-t border-slate-100 pt-6"
        >
          <h3
            id="product-review-heading"
            className="mb-4 text-lg font-bold text-[#0b1739]"
          >
            Product preview
          </h3>
          <div className="mx-auto max-w-sm">
            <ProductCard product={reviewProduct} preview />
          </div>
        </section>
      )}
    </section>
  )
}
