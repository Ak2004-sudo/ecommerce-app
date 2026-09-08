import { Link } from 'react-router-dom'
import type { CartItem } from '../../types'
import { useCart } from '../../context/CartContext'

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 border-b border-gray-200 py-4 last:border-b-0">
      <img
        src={item.image_url}
        alt={item.name}
        className="h-20 w-20 flex-shrink-0 rounded-md border border-gray-200 object-cover"
      />
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product_id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
          {item.name}
        </Link>
        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
        {item.quantity >= item.stock_quantity && (
          <p className="mt-1 text-xs text-amber-600">Max available stock reached</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
          className="h-7 w-7 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Decrease quantity"
        >
          &minus;
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <button
          type="button"
          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
          disabled={item.quantity >= item.stock_quantity}
          className="h-7 w-7 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="w-20 flex-shrink-0 text-right text-sm font-semibold text-gray-900">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
      <button
        type="button"
        onClick={() => removeItem(item.product_id)}
        className="flex-shrink-0 text-sm text-gray-400 hover:text-red-600"
        aria-label="Remove item"
      >
        Remove
      </button>
    </div>
  )
}
