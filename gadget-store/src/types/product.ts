export type ProductCategory =
  | 'Phones'
  | 'Tablets'
  | 'Laptops'
  | 'Gaming Consoles'
  | 'Accessories'

export type ProductCondition =
  | 'New'
  | 'Used'
  | 'Refurbished'

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: ProductCategory
  condition: ProductCondition
  description: string
  priceInKobo: number
  images: string[]
  availability: 'In stock' | 'Out of stock'
  specifications: Record<string, string>
}