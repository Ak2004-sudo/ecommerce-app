import { useEffect, useState } from 'react'
import { getAdminStats } from '../../api/admin'
import { getApiErrorMessage } from '../../api/client'
import type { AdminStats } from '../../types'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

const CARD_CONFIG: { key: keyof AdminStats; label: string; format: (v: number) => string; accent: string }[] = [
  { key: 'revenue', label: 'Total revenue', format: (v) => `$${v.toFixed(2)}`, accent: 'text-brand-600' },
  { key: 'order_count', label: 'Orders', format: (v) => String(v), accent: 'text-emerald-600' },
  { key: 'product_count', label: 'Products', format: (v) => String(v), accent: 'text-indigo-600' },
  { key: 'low_stock_count', label: 'Low stock items', format: (v) => String(v), accent: 'text-amber-600' },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminStats()
      .then((res) => {
        if (!cancelled) setStats(res)
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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6">
        {isLoading && <Spinner label="Loading stats..." />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARD_CONFIG.map((card) => (
              <div key={card.key} className="rounded-lg border border-gray-200 bg-white p-5">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className={`mt-2 text-3xl font-bold ${card.accent}`}>{card.format(stats[card.key])}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
