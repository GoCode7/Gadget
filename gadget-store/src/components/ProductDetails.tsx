import type { Product } from '../types/product'

type ProductDetailsProps = {
  product: Product
}

export default function ProductDetails({
  product,
}: ProductDetailsProps) {
  return (
    <details className="mt-4 border-t border-slate-200 pt-4">
      <summary className="cursor-pointer rounded text-sm font-semibold text-blue-700">
        Product details
        <span className="sr-only"> for {product.name}</span>
      </summary>

      <div className="mt-4">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
          {product.description}
        </p>

        <dl className="mt-4 divide-y divide-slate-100">
          <div className="grid grid-cols-2 gap-3 py-3 text-sm">
            <dt className="text-slate-500">Brand</dt>
            <dd className="break-words font-medium">
              {product.brand}
            </dd>
          </div>

          {Object.entries(product.specifications).map(
            ([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-2 gap-3 py-3 text-sm"
              >
                <dt className="break-words text-slate-500">
                  {label}
                </dt>

                <dd className="break-words font-medium">
                  {value}
                </dd>
              </div>
            ),
          )}
        </dl>
      </div>
    </details>
  )
}