import apiClient from './client'
import type { Order, OrderCreatePayload, OrderStatus } from '../types'

export function createOrder(payload: OrderCreatePayload) {
  return apiClient.post<Order>('/orders', payload).then((res) => res.data)
}

export function listMyOrders() {
  return apiClient.get<Order[]>('/orders/me').then((res) => res.data)
}

export function getOrder(id: number) {
  return apiClient.get<Order>(`/orders/${id}`).then((res) => res.data)
}

export function listAllOrders(status?: OrderStatus) {
  return apiClient.get<Order[]>('/orders', { params: status ? { status } : undefined }).then((res) => res.data)
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((res) => res.data)
}
