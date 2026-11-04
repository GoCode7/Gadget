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
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'

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

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

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

function getImageExtension(image: File): string {
  const extension = imageExtensions[image.type]

  if (!extension) {
    throw new Error('Choose a JPG, PNG, or WebP image.')
  }

  if (image.size === 0 || image.size > 5 * 1024 * 1024) {
    throw new Error(
      'Choose a non-empty image that is 5 MB or smaller.',
    )
  }

  return extension
}

export default function ProductsProvider({
  children,
}: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [authRevision, setAuthRevision] = useState(0)
  const requestNumber = useRef(0)

  const loadProducts = useCallback(async (): Promise<void> => {
    const currentRequest = ++requestNumber.current

    try {
      const { data, error } = await getSupabaseClient()
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

  const refreshProducts = useCallback(async (): Promise<void> => {
    setLoading(true)
    setLoadError('')
    await loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(() => {
      requestNumber.current += 1
      setProducts([])
      setLoading(true)
      setLoadError('')
      setAuthRevision((current) => current + 1)
    })

    return () => {
      subscription.unsubscribe()
      requestNumber.current += 1
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [authRevision, loadProducts])

  async function verifyAdmin(): Promise<void> {
    const { data, error } = await getSupabaseClient().rpc('is_admin')

    if (error || data !== true) {
      throw new Error(
        'Admin access could not be verified. Sign in again.',
      )
    }
  }

  async function addProduct(
    details: NewProduct,
    image: File,
  ): Promise<void> {
    const extension = getImageExtension(image)

    if (
      !Number.isSafeInteger(details.priceInKobo) ||
      details.priceInKobo <= 0
    ) {
      throw new Error('Enter a valid product price.')
    }

    await verifyAdmin()

    const client = getSupabaseClient()
    const id = crypto.randomUUID()
    const imagePath = `${id}/main.${extension}`
    const { error: uploadError } = await client.storage
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

    const { data: imageData } = client.storage
      .from('product-images')
      .getPublicUrl(imagePath)

    const { error: insertError } = await client
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
        try {
          await client.storage
            .from('product-images')
            .remove([imagePath])
        } catch {
          // Keep the original database error as the operation result.
        }
      }

      throw new Error(
        'Saving could not be confirmed. Refresh the inventory before retrying to avoid creating a duplicate.',
      )
    }

    await refreshProducts()
  }

  async function updateAvailability(
    productId: string,
    availability: Product['availability'],
  ): Promise<void> {
    const { data, error } = await getSupabaseClient()
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
    replacementImage?: File,
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

    await verifyAdmin()

    const client = getSupabaseClient()
    let uploadedImagePath: string | undefined
    let images: string[] | undefined

    if (replacementImage) {
      const extension = getImageExtension(replacementImage)
      uploadedImagePath =
        `${productId}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await client.storage
        .from('product-images')
        .upload(uploadedImagePath, replacementImage, {
          contentType: replacementImage.type,
          upsert: false,
        })

      if (uploadError) {
        throw new Error(
          'The replacement photo could not be uploaded. Check your connection and storage permissions.',
        )
      }

      const { data: imageData } = client.storage
        .from('product-images')
        .getPublicUrl(uploadedImagePath)
      images = [imageData.publicUrl]
    }

    const { data, error } = await client
      .from('products')
      .update({
        name,
        brand,
        category: changes.category,
        condition: changes.condition,
        description,
        price_in_kobo: changes.priceInKobo,
        specifications: changes.specifications,
        ...(images ? { images } : {}),
      })
      .eq('id', productId)
      .select(productColumns)
      .returns<ProductRow[]>()
      .maybeSingle()

    if (error || !data) {
      if (uploadedImagePath) {
        try {
          await client.storage
            .from('product-images')
            .remove([uploadedImagePath])
        } catch {
          // Preserve the database result if cleanup fails.
        }
      }

      if (error) {
        throw new Error(
          'The update could not be confirmed. Refresh the inventory to check the saved details before retrying.',
        )
      }

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
