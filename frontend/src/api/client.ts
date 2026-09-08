import axios from 'axios'
import type { ApiErrorBody } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export const TOKEN_STORAGE_KEY = 'ecommerce_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Extracts a human-readable message from an axios/FastAPI error response. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail.map((d) => d.msg).join(', ')
      }
    }
    if (data?.message) return data.message
    if (error.message === 'Network Error') return 'Cannot reach the server. Please try again later.'
  }
  return fallback
}

export default apiClient
