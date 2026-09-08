import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct } from '../api/products'
import { getApiErrorMessage } from '../api/client'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    getProduct(Number(id))
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Product not found.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) return <Spinner label="Loading product..." />
  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ErrorMessage message={error ?? 'Product not found.'} />
        <Link to="/products" className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700">
          &larr; Back to products
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock_quantity <= 0

  function handleAddToCart() {
    if (!product) return
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`)
  }

  function handleBuyNow() {
    if (!product) return
    addItem(product, quantity)
    navigate('/cart')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/products" className="hover:text-brand-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          {product.category && (
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{product.category.name}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-gray-900">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : (
              <span className="text-gray-500">{product.stock_quantity} in stock</span>
            )}
          </p>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 rounded-md border border-brand-600 px-6 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
