import apiClient from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types'

export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponse>('/auth/login', payload).then((res) => res.data)
}

export function register(payload: RegisterPayload) {
  return apiClient.post<AuthResponse>('/auth/register', payload).then((res) => res.data)
}

export function getMe() {
  return apiClient.get<User>('/auth/me').then((res) => res.data)
}
