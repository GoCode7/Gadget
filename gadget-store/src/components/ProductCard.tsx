import type { Product } from '../types/product'
import { store } from '../data/store'
import ProductImage from './ProductImage'
import ProductDetails from './ProductDetails'

type ProductCardProps = {
  product: Product
  preview?: boolean
}

export default function ProductCard({
  product,
  preview = false,
}: ProductCardProps) {
  const isAvailable = product.availability === 'In stock'

  const formattedPrice = new Intl.NumberFormat(store.locale, {
    style: 'currency',
    currency: store.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: product.priceInKobo % 100 === 0 ? 0 : 2,
  }).format(product.priceInKobo / 100)

  const message = [
    `Hello ${store.name},`,
    `I'm interested in ${product.name}.`,
    `Product ID: ${product.id}`,
    `Listed price: ${formattedPrice}`,
    `Condition: ${product.condition}`,
    'Please confirm availability and delivery costs.',
  ].join('\n')

  const whatsappUrl =
    `https://wa.me/${store.whatsappNumber}` +
    `?text=${encodeURIComponent(message)}`

  return (
    <article className="af-device-card">
      <div className="af-device-visual">
        <span className="af-device-condition">
          {product.condition}
        </span>

        <ProductImage
          key={product.images[0] ?? 'no-image'}
          src={product.images[0]}
          alt={product.name}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {product.category}
          </p>

          <span
            className={`af-stock-label ${
              isAvailable ? 'is-available' : ''
            }`}
          >
            <span aria-hidden="true" />
            {product.availability}
          </span>
        </div>

        <h3 className="mt-3 break-words text-lg font-semibold leading-7 tracking-tight text-slate-950">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {product.brand}
        </p>

        <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          {formattedPrice}
        </p>

        <ProductDetails product={product} />

        <div className="mt-auto pt-6">
          {preview ? (
            <p className="af-device-unavailable">
              Admin preview only
            </p>
          ) : isAvailable ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="af-device-enquiry"
            >
              Enquire on WhatsApp

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="af-enquiry-arrow h-4 w-4"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ) : (
            <p className="af-device-unavailable">
              Currently unavailable
            </p>
          )}
        </div>
      </div>
    </article>
  )
}