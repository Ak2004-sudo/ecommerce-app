import apiClient from './client'
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductCreatePayload,
  ProductListParams,
  ProductUpdatePayload,
} from '../types'

export function listProducts(params: ProductListParams = {}) {
  return apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((res) => res.data)
}

export function getProduct(id: number) {
  return apiClient.get<Product>(`/products/${id}`).then((res) => res.data)
}

export function createProduct(payload: ProductCreatePayload) {
  return apiClient.post<Product>('/products', payload).then((res) => res.data)
}

export function updateProduct(id: number, payload: ProductUpdatePayload) {
  return apiClient.put<Product>(`/products/${id}`, payload).then((res) => res.data)
}

export function deleteProduct(id: number) {
  return apiClient.delete<void>(`/products/${id}`).then((res) => res.data)
}

export function listCategories() {
  return apiClient.get<Category[]>('/categories').then((res) => res.data)
}

export function createCategory(payload: { name: string; slug: string }) {
  return apiClient.post<Category>('/categories', payload).then((res) => res.data)
}
