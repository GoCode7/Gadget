import { createContext, useContext } from 'react'
import type { Product } from '../types/product'

export type NewProduct = Omit<Product, 'id' | 'slug' | 'images'>

export type ProductEdits = Pick<
  Product,
  | 'name'
  | 'brand'
  | 'description'
  | 'priceInKobo'
  | 'category'
  | 'condition'
  | 'specifications'
>

type ProductsContextValue = {
  products: Product[]
  loading: boolean
  loadError: string

  refreshProducts: () => Promise<void>

  addProduct: (
    product: NewProduct,
    image: File,
  ) => Promise<void>

  updateAvailability: (
    productId: string,
    availability: Product['availability'],
  ) => Promise<void>

  updateProduct: (
    productId: string,
    changes: ProductEdits,
    replacementImage?: File,
  ) => Promise<void>
}

export const ProductsContext =
  createContext<ProductsContextValue | null>(null)

export function useProducts() {
  const context = useContext(ProductsContext)

  if (!context) {
    throw new Error(
      'useProducts must be used inside ProductsProvider.',
    )
  }

  return context
}