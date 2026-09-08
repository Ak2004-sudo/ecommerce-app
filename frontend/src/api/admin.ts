import apiClient from './client'
import type { AdminStats } from '../types'

export function getAdminStats() {
  return apiClient.get<AdminStats>('/admin/stats').then((res) => res.data)
}
