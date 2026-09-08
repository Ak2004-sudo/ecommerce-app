import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Product } from '../../types'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const outOfStock = product.stock_quantity <= 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        {product.category && <p className="text-xs text-gray-500">{product.category.name}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
