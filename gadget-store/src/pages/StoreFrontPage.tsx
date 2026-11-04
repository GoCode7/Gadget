import { useState } from 'react'
import Header from '../components/layout/Header'
import CategorySection from '../components/CategorySection'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import type { ProductCategory } from '../types/product'
import Footer from '../components/layout/Footer'


type SortOrder = 'default' | 'price-asc' | 'price-desc'

export default function StoreFrontPage() {
    const { products } = useProducts()
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | 'All'>('All')
      const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLowerCase()

const filteredProducts = products.filter((product) => {
  const matchesCategory =
    selectedCategory === 'All' ||
    product.category === selectedCategory

  const searchableText = [
    product.name,
    product.brand,
    product.category,
    product.description,
  ]
    .join(' ')
    .toLowerCase()

  const matchesSearch = searchableText.includes(normalizedQuery)

  return matchesCategory && matchesSearch
})
const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortOrder === 'price-asc') {
    return a.priceInKobo - b.priceInKobo
  }

  if (sortOrder === 'price-desc') {
    return b.priceInKobo - a.priceInKobo
  }

  return 0
})

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Phones. Laptops. Gaming. More.
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Find your next device at AfeTech.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Explore phones, tablets, laptops, gaming consoles,
            and accessories. Contact us on WhatsApp to confirm
            availability and place your order.
          </p>

          <a
            href="#products"
            className="mt-8 inline-flex rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Browse products
          </a>
        </section>

        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section
          id="products"
          aria-labelledby="products-heading"
          className="scroll-mt-6 py-12"
        >
          <h2 id="products-heading" className="text-2xl font-bold">
            {selectedCategory === 'All'
              ? 'All products'
              : selectedCategory}
          </h2>
          <div className="mt-6">
  <label
    htmlFor="product-search"
    className="block text-sm font-medium text-slate-700"
  >
    Search products
  </label>

  <input
    id="product-search"
    type="search"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search by name, brand, or device type"
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 sm:max-w-md"
  />
  <div className="mt-4">
  <label
    htmlFor="product-sort"
    className="block text-sm font-medium text-slate-700"
  >
    Sort products
  </label>

  <select
    id="product-sort"
    value={sortOrder}
    onChange={(event) => {
      const value = event.target.value

      if (
        value === 'default' ||
        value === 'price-asc' ||
        value === 'price-desc'
      ) {
        setSortOrder(value)
      }
    }}
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-2 focus:outline-blue-600 sm:max-w-xs"
  >
    <option value="default">Default order</option>
    <option value="price-asc">Price: low to high</option>
    <option value="price-desc">Price: high to low</option>
  </select>
</div>
</div>

          <p
            role="status"
            className="mt-2 text-sm text-slate-600"
          >
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>

          {filteredProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
  <p className="font-medium">
    {products.length === 0
      ? 'No products listed yet.'
      : 'No products match your selection.'}
  </p>

  <p className="mt-2 text-sm text-slate-600">
    {products.length === 0
      ? 'Contact AfeTech for current availability.'
      : 'Try another search or browse all categories.'}
  </p>

  {(searchQuery !== '' || selectedCategory !== 'All') && (
    <button
      type="button"
      onClick={() => {
        setSearchQuery('')
        setSelectedCategory('All')
      }}
      className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
    >
      Clear filters
    </button>
  )}
</div>
          )}
        </section>

        <section id="contact" className="scroll-mt-6 py-12">
          <h2 className="text-2xl font-bold">
            Contact AfeTech
          </h2>

          <a
            href="https://wa.me/2349133157674"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Chat on WhatsApp: 09133157674
          </a>
        </section>
      </main>
      <Footer />
    </div>
  )
}