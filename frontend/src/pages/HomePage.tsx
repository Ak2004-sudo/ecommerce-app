import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../api/products'
import { getApiErrorMessage } from '../api/client'
import type { Product } from '../types'
import ProductCard from '../components/product/ProductCard'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    listProducts({ page: 1, page_size: 8 })
      .then((res) => {
        if (!cancelled) setProducts(res.items)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everyday essentials, delivered simply.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            A lean demo storefront &mdash; browse the catalog, add to cart, and check out in a few clicks.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Shop all products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all &rarr;
          </Link>
        </div>

        {isLoading && <Spinner label="Loading products..." />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
