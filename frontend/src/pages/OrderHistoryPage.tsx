import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyOrders } from '../api/orders'
import { getApiErrorMessage } from '../api/client'
import type { Order } from '../types'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/order/StatusBadge'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listMyOrders()
      .then((res) => {
        if (!cancelled) setOrders(res)
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">My orders</h1>

      <div className="mt-6">
        {isLoading && <Spinner label="Loading orders..." />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            title="No orders yet"
            description="Your placed orders will show up here."
            action={
              <Link
                to="/products"
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Start shopping
              </Link>
            }
          />
        )}
        {!isLoading && !error && orders.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${order.id}`} className="text-brand-600 hover:text-brand-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
