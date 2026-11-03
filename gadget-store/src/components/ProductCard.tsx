import type { Product } from '../types/product'
import { store } from '../data/store'
import ProductImage from './ProductImage'
import ProductDetails from './ProductDetails'

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0]
  const isAvailable = product.availability === 'In stock'

  const formattedPrice = new Intl.NumberFormat(store.locale, {
    style: 'currency',
    currency: store.currency,
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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ProductImage
  key={image ?? 'no-image'}
  src={image}
  alt={product.name}
/>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {product.category} · {product.condition}
        </p>

        <h3 className="mt-2 text-lg font-semibold">
          {product.name}
        </h3>

        <p className="mt-3 text-xl font-bold">
          {formattedPrice}
        </p>

        <p
  className={`mt-2 text-sm ${
    isAvailable ? 'text-green-700' : 'text-slate-500'
  }`}
>
  {product.availability}
</p>
<ProductDetails product={product} />

        <div className="mt-auto pt-5">
          {isAvailable ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Enquire on WhatsApp
            </a>
          ) : (
            <p className="rounded-lg bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
              Currently unavailable
            </p>
          )}
        </div>
      </div>
    </article>
  )
}