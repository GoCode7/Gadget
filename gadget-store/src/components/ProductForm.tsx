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
  availability: 'In stock' | 'Out of stock'
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

const textFields = [
  {
    name: 'name',
    label: 'Product name *',
    required: true,
    maxLength: 150,
    placeholder: 'e.g. Samsung Galaxy S24',
  },
  {
    name: 'brand',
    label: 'Brand *',
    required: true,
    maxLength: 80,
    placeholder: 'e.g. Samsung',
  },
  {
    name: 'storage',
    label: 'Storage capacity (optional)',
    required: false,
    maxLength: 80,
    placeholder: 'e.g. 256 GB',
  },
  {
    name: 'colour',
    label: 'Colour (optional)',
    required: false,
    maxLength: 80,
    placeholder: 'e.g. Black',
  },
] as const

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600'

export default function ProductForm() {
  const { addProduct } = useProducts()

  const [values, setValues] =
    useState<ProductFormValues>({ ...initialValues })

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

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [selectedImage])

  function clearFeedback() {
    setFormError('')
    setSuccessMessage('')
    setReviewProduct(null)
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    clearFeedback()

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setImageError('Choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setImageError(
        'Choose a non-empty image that is 5 MB or smaller.',
      )
      event.target.value = ''
      return
    }

    setImageError('')

    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    })

    event.target.value = ''
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
      setFormError(
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
    if (
      !reviewProduct ||
      !selectedImage ||
      savingRef.current
    ) {
      return
    }

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

      setSuccessMessage(
        'Product saved and published successfully.',
      )
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
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2
        id="product-form-heading"
        className="text-2xl font-bold"
      >
        Add a product
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Complete the details, review the card, then publish.
        Published products are visible to customers.
        Fields marked * are required.
      </p>

      <form
        onSubmit={handleReview}
        onChange={clearFeedback}
        aria-busy={isSaving}
        className="mt-6"
      >
        <fieldset
          disabled={isSaving}
          className="grid min-w-0 gap-6 sm:grid-cols-2 disabled:opacity-60"
        >
          <legend className="sr-only">
            Product information
          </legend>

          {textFields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={`product-${field.name}`}
                className="text-sm font-medium"
              >
                {field.label}
              </label>

              <input
                id={`product-${field.name}`}
                type="text"
                required={field.required}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) => {
                  const value = event.target.value

                  setValues((current) => ({
                    ...current,
                    [field.name]: value,
                  }))
                }}
                className={inputClassName}
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="product-category"
              className="text-sm font-medium"
            >
              Category *
            </label>

            <select
              id="product-category"
              required
              value={values.category}
              onChange={(event) => {
                const selectedValue = event.target.value

                const category = categories.find(
                  (item) => item === selectedValue,
                )

                if (category) {
                  setValues((current) => ({
                    ...current,
                    category,
                  }))
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
            <label
              htmlFor="product-condition"
              className="text-sm font-medium"
            >
              Condition *
            </label>

            <select
              id="product-condition"
              required
              value={values.condition}
              onChange={(event) => {
                const condition = event.target.value

                if (
                  condition === 'New' ||
                  condition === 'Used' ||
                  condition === 'Refurbished'
                ) {
                  setValues((current) => ({
                    ...current,
                    condition,
                  }))
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
            <label
              htmlFor="product-price"
              className="text-sm font-medium"
            >
              Price in naira (₦) *
            </label>

            <input
              id="product-price"
              type="number"
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
            <label
              htmlFor="product-availability"
              className="text-sm font-medium"
            >
              Availability *
            </label>

            <select
              id="product-availability"
              required
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
              <option value="Out of stock">
                Out of stock
              </option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="product-description"
              className="text-sm font-medium"
            >
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
              className={inputClassName}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="product-image"
              className="block text-sm font-medium"
            >
              Product photo *
            </label>

            <p
              id="product-image-help"
              className="mt-2 text-sm text-slate-600"
            >
              Select one JPG, PNG, or WebP image, up to 5 MB.
            </p>

            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              aria-invalid={Boolean(imageError)}
              aria-describedby={
                imageError
                  ? 'product-image-help product-image-error'
                  : 'product-image-help'
              }
              className="mt-3 block w-full rounded-lg border border-slate-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
            />

            {imageError && (
              <p
                id="product-image-error"
                role="alert"
                className="mt-2 text-sm text-red-700"
              >
                {imageError}
              </p>
            )}

            {selectedImage && (
              <figure className="mt-4">
                <img
                  src={selectedImage.previewUrl}
                  alt="Selected product photo preview"
                  className="h-56 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain p-4"
                />

                <figcaption className="mt-2 break-words text-sm text-slate-600">
                  {selectedImage.file.name}
                </figcaption>
              </figure>
            )}

            {(selectedImage || imageError) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null)
                  setImageError('')
                  clearFeedback()
                }}
                className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Clear photo selection
              </button>
            )}
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Review product
            </button>
          </div>
        </fieldset>
      </form>

      {formError && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800"
        >
          {formError}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800"
        >
          {successMessage}
        </p>
      )}

      {reviewProduct && (
        <section
          aria-labelledby="preview-heading"
          className="mt-8 border-t border-slate-200 pt-8"
        >
          <h3
            id="preview-heading"
            className="text-xl font-bold"
          >
            Product preview
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Check the photo, price, and specifications before
            publishing.
          </p>

          <div className="mt-5 max-w-sm">
            <ProductCard product={reviewProduct} preview />
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="mt-5 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Publishing…' : 'Publish product'}
          </button>

          {isSaving && (
            <p
              role="status"
              className="mt-3 text-sm text-slate-600"
            >
              Uploading the photo and saving the product…
            </p>
          )}
        </section>
      )}
    </section>
  )
}