import { categories } from '../data/categories'
import type { ProductCategory } from '../types/product'

type CategorySectionProps = {
  selectedCategory: ProductCategory | 'All'
  onSelectCategory: (category: ProductCategory | 'All') => void
}

export default function CategorySection({
  selectedCategory,
  onSelectCategory,
}: CategorySectionProps) {
  const options: (ProductCategory | 'All')[] = [
    'All',
    ...categories,
  ]

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-6 border-t border-slate-200 py-12"
    >
      <h2 id="categories-heading" className="text-2xl font-bold">
        Shop by category
      </h2>

      <p className="mt-3 text-slate-600">
        Choose a category to explore our products.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {options.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => onSelectCategory(category)}
            className={`rounded-lg border px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
              selectedCategory === category
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:text-blue-700'
            }`}
          >
            {category === 'All' ? 'All products' : category}
          </button>
        ))}
      </div>
    </section>
  )
}