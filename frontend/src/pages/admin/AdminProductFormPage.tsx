import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createProduct, getProduct, listCategories, updateProduct } from '../../api/products'
import { getApiErrorMessage } from '../../api/client'
import type { Category } from '../../types'
import Spinner from '../../components/ui/Spinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

interface FormState {
  name: string
  description: string
  price: string
  stock_quantity: string
  category_id: string
  image_url: string
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category_id: '',
  image_url: '',
  is_active: true,
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {
        // Non-critical; the select will just be empty.
      })
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getProduct(Number(id))
      .then((product) => {
        if (cancelled) return
        setForm({
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock_quantity: String(product.stock_quantity),
          category_id: String(product.category_id),
          image_url: product.image_url,
          is_active: product.is_active,
        })
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load product.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      category_id: Number(form.category_id),
      image_url: form.image_url,
      is_active: form.is_active,
    }

    if (!payload.category_id) {
      setError('Please select a category.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && id) {
        await updateProduct(Number(id), payload)
        toast.success('Product updated.')
      } else {
        await createProduct(payload)
        toast.success('Product created.')
      }
      navigate('/admin/products')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save product.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <Spinner label="Loading product..." />

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit product' : 'New product'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
        {error && <ErrorMessage message={error} />}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="price">
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="stock_quantity">
              Stock quantity
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              required
              value={form.stock_quantity}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category_id">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            value={form.category_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="image_url">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            required
            type="url"
            value={form.image_url}
            onChange={handleChange}
            className={inputClass}
            placeholder="https://images.unsplash.com/..."
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="mt-2 h-24 w-24 rounded-md border border-gray-200 object-cover"
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          Active (visible to customers)
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
