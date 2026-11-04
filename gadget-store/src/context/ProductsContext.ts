import { createContext, useContext } from 'react'
import type { Product } from '../types/product'

export type NewProduct = Omit<Product, 'id' | 'slug' | 'images'>

type ProductsContextValue = {
  products: Product[]
  addProduct: (product: NewProduct, image: File) => void
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