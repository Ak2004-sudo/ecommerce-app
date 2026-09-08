import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'
import { getApiErrorMessage } from '../api/client'
import type { Order } from '../types'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import StatusBadge from '../components/order/StatusBadge'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getOrder(Number(id))
      .then((res) => {
        if (!cancelled) setOrder(res)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Order not found.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) return <Spinner label="Loading order..." />
  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ErrorMessage message={error ?? 'Order not found.'} />
        <Link to="/orders" className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700">
          &larr; Back to my orders
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/orders" className="text-sm text-brand-600 hover:text-brand-700">
        &larr; Back to my orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.product_name_snapshot}</p>
                <p className="text-gray-500">
                  ${item.unit_price_snapshot.toFixed(2)} &times; {item.quantity}
                </p>
              </div>
              <span className="font-medium text-gray-900">${item.subtotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
          <span>Total</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Shipping address</h2>
        <p className="text-sm text-gray-600">{order.shipping_full_name}</p>
        <p className="text-sm text-gray-600">{order.shipping_address_line1}</p>
        {order.shipping_address_line2 && <p className="text-sm text-gray-600">{order.shipping_address_line2}</p>}
        <p className="text-sm text-gray-600">
          {order.shipping_city}, {order.shipping_postal_code}
        </p>
        <p className="text-sm text-gray-600">{order.shipping_country}</p>
      </div>
    </div>
  )
}
