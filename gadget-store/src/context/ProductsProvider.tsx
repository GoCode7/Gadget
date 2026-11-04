import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { ProductsContext } from './ProductsContext'
import type {
  NewProduct,
  ProductEdits,
} from './ProductsContext'
import type { Product } from '../types/product'
import { supabase } from '../lib/supabase'

type ProductsProviderProps = {
  children: ReactNode
}

type ProductRow = {
  id: string
  slug: string
  name: string
  brand: string
  category: Product['category']
  condition: Product['condition']
  description: string
  price_in_kobo: number
  images: string[]
  availability: Product['availability']
  specifications: Record<string, string>
}

const productColumns = [
  'id',
  'slug',
  'name',
  'brand',
  'category',
  'condition',
  'description',
  'price_in_kobo',
  'images',
  'availability',
  'specifications',
].join(',')

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    condition: row.condition,
    description: row.description,
    priceInKobo: row.price_in_kobo,
    images: row.images,
    availability: row.availability,
    specifications: row.specifications,
  }
}

export default function ProductsProvider({
  children,
}: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [authRevision, setAuthRevision] = useState(0)

  const requestNumber = useRef(0)

  // Automatic loading: state updates happen after the request.
  const loadProducts = useCallback(async (): Promise<void> => {
    const currentRequest = ++requestNumber.current

    try {
      const { data, error } = await supabase
        .from('products')
        .select(productColumns)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .returns<ProductRow[]>()

      if (currentRequest !== requestNumber.current) return

      if (error) throw error

      setProducts((data ?? []).map(toProduct))
      setLoadError('')
    } catch {
      if (currentRequest !== requestNumber.current) return

      setProducts([])
      setLoadError(
        'Products could not be loaded. Please try again.',
      )
    } finally {
      if (currentRequest === requestNumber.current) {
        setLoading(false)
      }
    }
  }, [])

  // Manual refresh: immediately show loading feedback.
  const refreshProducts = useCallback(
    async (): Promise<void> => {
      setLoading(true)
      setLoadError('')

      await loadProducts()
    },
    [loadProducts],
  )

  // Subscribe to authentication changes.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      requestNumber.current += 1

      setProducts([])
      setLoading(true)
      setLoadError('')
      setAuthRevision((current) => current + 1)
    })

    return () => {
      subscription.unsubscribe()

      // Prevent pending requests from updating an unmounted provider.
      requestNumber.current += 1
    }
  }, [])

  // Load initially and whenever authentication changes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [authRevision, loadProducts])

  async function addProduct(
    details: NewProduct,
    image: File,
  ): Promise<void> {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }

    const extension = extensions[image.type]

    if (!extension) {
      throw new Error('Choose a JPG, PNG, or WebP image.')
    }

    if (image.size === 0 || image.size > 5 * 1024 * 1024) {
      throw new Error(
        'Choose a non-empty image that is 5 MB or smaller.',
      )
    }

    if (
      !Number.isSafeInteger(details.priceInKobo) ||
      details.priceInKobo <= 0
    ) {
      throw new Error('Enter a valid product price.')
    }

    const { data: isAdmin, error: adminError } =
      await supabase.rpc('is_admin')

    if (adminError || isAdmin !== true) {
      throw new Error(
        'Admin access could not be verified. Sign in again.',
      )
    }

    const id = crypto.randomUUID()
    const imagePath = `${id}/main.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(imagePath, image, {
        contentType: image.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(
        'The photo could not be uploaded. Check your connection and storage permissions.',
      )
    }

    const { data: imageData } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath)

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        id,
        slug: id,
        name: details.name,
        brand: details.brand,
        category: details.category,
        condition: details.condition,
        description: details.description,
        price_in_kobo: details.priceInKobo,
        images: [imageData.publicUrl],
        availability: details.availability,
        specifications: details.specifications,
        is_published: true,
      })

    if (insertError) {
      const confirmedRejections = [
        '42501',
        '23502',
        '23503',
        '23505',
        '23514',
        '22P02',
      ]

      if (confirmedRejections.includes(insertError.code)) {
        // Best-effort cleanup after a confirmed insert rejection.
        try {
          await supabase.storage
            .from('product-images')
            .remove([imagePath])
        } catch {
          // Preserve the original saving error if cleanup fails.
        }
      }

      throw new Error(
        'Saving could not be confirmed. Refresh the inventory before retrying to avoid creating a duplicate.',
      )
    }

    // The product is already saved. Refresh errors are displayed
    // through loadError rather than reported as a saving failure.
    await refreshProducts()
  }
async function updateAvailability(
  productId: string,
  availability: Product['availability'],
): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .update({ availability })
    .eq('id', productId)
    .select('id, availability')
    .maybeSingle()

  if (error) {
    throw new Error(
      'Availability could not be updated. Check your connection and admin access.',
    )
  }

  if (!data) {
    throw new Error(
      'The product was not found or you no longer have permission to update it.',
    )
  }

  setProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? { ...product, availability: data.availability }
        : product,
    ),
  )
}
async function updateProduct(
  productId: string,
  changes: ProductEdits,
): Promise<void> {
  const name = changes.name.trim()
  const brand = changes.brand.trim()
  const description = changes.description.trim()

  if (
    name.length === 0 ||
    name.length > 150 ||
    brand.length === 0 ||
    brand.length > 80 ||
    description.length === 0 ||
    description.length > 5000
  ) {
    throw new Error(
      'Enter a name, brand, and description within the allowed lengths.',
    )
  }

  if (
    !Number.isSafeInteger(changes.priceInKobo) ||
    changes.priceInKobo <= 0
  ) {
    throw new Error('Enter a valid price greater than zero.')
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      name,
      brand,
      description,
      price_in_kobo: changes.priceInKobo,
    })
    .eq('id', productId)
    .select(productColumns)
    .returns<ProductRow[]>()
    .maybeSingle()

  if (error) {
    throw new Error(
      'The update could not be confirmed. Refresh the inventory to check the saved details before retrying.',
    )
  }

  if (!data) {
    throw new Error(
      'The product was not found or you no longer have permission to update it.',
    )
  }

  const updatedProduct = toProduct(data)

  setProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId ? updatedProduct : product,
    ),
  )
}
  return (
  <ProductsContext.Provider
    value={{
      products,
      loading,
      loadError,
      refreshProducts,
      addProduct,
      updateAvailability,
      updateProduct,
    }}
  >
    {children}
  </ProductsContext.Provider>
)
}