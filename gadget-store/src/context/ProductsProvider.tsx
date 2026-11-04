import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ProductsContext } from './ProductsContext'
import type { NewProduct } from './ProductsContext'
import type { Product } from '../types/product'
import { products as initialProducts } from '../data/products'

type ProductsProviderProps = {
  children: ReactNode
}

export default function ProductsProvider({
  children,
}: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>(() => [
    ...initialProducts,
  ])

  const imageUrls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      imageUrls.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })

      imageUrls.current = []
    }
  }, [])

  function addProduct(details: NewProduct, image: File) {
    const id = crypto.randomUUID()
    const imageUrl = URL.createObjectURL(image)

    imageUrls.current.push(imageUrl)

    const product: Product = {
      ...details,
      specifications: { ...details.specifications },
      id,
      slug: id,
      images: [imageUrl],
    }

    setProducts((currentProducts) => [
      product,
      ...currentProducts,
    ])
  }

  return (
    <ProductsContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}