import type { ReactNode } from 'react'
import { categories } from '../data/categories'
import type { ProductCategory } from '../types/product'

type CategorySectionProps = {
  selectedCategory: ProductCategory | 'All'
  onSelectCategory: (
    category: ProductCategory | 'All',
  ) => void
}

const icons: Record<ProductCategory | 'All', ReactNode> = {
  All: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  Phones: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 5h4M11 19h2" />
    </>
  ),
  Tablets: (
    <>
      <rect x="3" y="2" width="18" height="20" rx="3" />
      <path d="M11 19h2" />
    </>
  ),
  Laptops: (
    <>
      <rect x="4" y="3" width="16" height="13" rx="2" />
      <path d="m4 16-2 4h20l-2-4M9 20h6" />
    </>
  ),
  'Gaming Consoles': (
    <>
      <path d="M7 7h10c2 0 3 2 3.5 4l1 5c.5 3-2 4-4 2l-2-2h-7l-2 2c-2 2-4.5 1-4-2l1-5C4 9 5 7 7 7Z" />
      <path d="M7 10v4M5 12h4M16 11h.01M18 13h.01" />
    </>
  ),
  Accessories: (
    <>
      <path d="M7 3v5M17 3v5" />
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 19v3m1-11-3 3h4l-3 3" />
    </>
  ),
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
      className="scroll-mt-36 py-12 sm:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="af-section-label">FIND YOUR CATEGORY</p>

          <h2
            id="categories-heading"
            className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            What’s your next upgrade?
          </h2>
        </div>

        <p className="max-w-xs text-sm leading-6 text-slate-500">
          From everyday essentials to your next gaming setup.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {options.map((category) => {
          const isSelected = selectedCategory === category

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(category)}
              className={`af-category-card ${
                isSelected ? 'is-selected' : ''
              }`}
            >
              <span className="af-category-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-7 w-7"
                >
                  {icons[category]}
                </svg>
              </span>

              <span className="mt-4 text-sm font-semibold">
                {category === 'All' ? 'All devices' : category}
              </span>

              <span className="mt-2 text-xs opacity-70">
                {isSelected ? 'Selected' : 'Explore'}
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}