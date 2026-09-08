import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'
import { getApiErrorMessage } from '../api/client'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'

interface ShippingForm {
  shipping_full_name: string
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
}

const EMPTY_FORM: ShippingForm = {
  shipping_full_name: '',
  shipping_address_line1: '',
  shipping_address_line2: '',
  shipping_city: '',
  shipping_postal_code: '',
  shipping_country: '',
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checking out."
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        shipping_full_name: form.shipping_full_name,
        shipping_address_line1: form.shipping_address_line1,
        shipping_address_line2: form.shipping_address_line2 || undefined,
        shipping_city: form.shipping_city,
        shipping_postal_code: form.shipping_postal_code,
        shipping_country: form.shipping_country,
      })
      clearCart()
      toast.success('Payment successful! Order placed.')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not place order. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-5">
        <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Shipping details</h2>

          {error && <ErrorMessage message={error} />}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_full_name">
              Full name
            </label>
            <input
              id="shipping_full_name"
              name="shipping_full_name"
              required
              value={form.shipping_full_name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_address_line1">
              Address line 1
            </label>
            <input
              id="shipping_address_line1"
              name="shipping_address_line1"
              required
              value={form.shipping_address_line1}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_address_line2">
              Address line 2 <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="shipping_address_line2"
              name="shipping_address_line2"
              value={form.shipping_address_line2}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_city">
                City
              </label>
              <input
                id="shipping_city"
                name="shipping_city"
                required
                value={form.shipping_city}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_postal_code">
                Postal code
              </label>
              <input
                id="shipping_postal_code"
                name="shipping_postal_code"
                required
                value={form.shipping_postal_code}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="shipping_country">
              Country
            </label>
            <input
              id="shipping_country"
              name="shipping_country"
              required
              value={form.shipping_country}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="mt-2 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
            This is a demo checkout &mdash; no real payment is processed. Clicking &ldquo;Pay Now&rdquo; immediately
            marks the order as paid.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? 'Processing...' : `Pay Now — $${subtotal.toFixed(2)}`}
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-base font-semibold text-gray-900">Order summary</h2>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.product_id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate pr-2">
                    {item.name} &times; {item.quantity}
                  </span>
                  <span className="flex-shrink-0 font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
