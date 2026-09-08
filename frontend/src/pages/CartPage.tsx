import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItemRow from '../components/cart/CartItemRow'
import EmptyState from '../components/ui/EmptyState'

export default function CartPage() {
  const { items, subtotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalog and add something you like."
          action={
            <Link
              to="/products"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Shop products
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
        <button type="button" onClick={clearCart} className="text-sm text-gray-400 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-4">
        {items.map((item) => (
          <CartItemRow key={item.product_id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-base font-medium text-gray-700">Subtotal</span>
        <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/products"
          className="rounded-md border border-gray-300 px-6 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue shopping
        </Link>
        <Link
          to="/checkout"
          className="rounded-md bg-brand-600 px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}
