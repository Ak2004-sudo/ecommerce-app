import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listProducts, deleteProduct } from '../../api/products'
import { getApiErrorMessage } from '../../api/client'
import type { Product } from '../../types'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function loadProducts() {
    setIsLoading(true)
    setError(null)
    listProducts({ page: 1, page_size: 100 })
      .then((res) => setProducts(res.items))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDelete(product: Product) {
    if (!confirm(`Deactivate "${product.name}"? It will no longer be visible to customers.`)) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      toast.success('Product deactivated.')
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_active: false } : p)))
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not deactivate product.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          New product
        </Link>
      </div>

      <div className="mt-6">
        {isLoading && <Spinner label="Loading products..." />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && products.length === 0 && (
          <EmptyState title="No products yet" description="Create your first product to get started." />
        )}
        {!isLoading && !error && products.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{product.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={!product.is_active || deletingId === product.id}
                          className="text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {deletingId === product.id ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      </div>
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
