// Domain types matching the backend schema (see implementation plan).

export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  category_id: number
  category?: Category | null
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductListParams {
  search?: string
  category_id?: number
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ProductCreatePayload {
  name: string
  description: string
  price: number
  stock_quantity: number
  category_id: number
  image_url: string
  is_active?: boolean
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>

export type OrderStatus = 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: number
  product_id: number
  product_name_snapshot: string
  unit_price_snapshot: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  status: OrderStatus
  total_amount: number
  shipping_full_name: string
  shipping_address_line1: string
  shipping_address_line2?: string | null
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderItemPayload {
  product_id: number
  quantity: number
}

export interface OrderCreatePayload {
  items: OrderItemPayload[]
  shipping_full_name: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
}

export interface AdminStats {
  revenue: number
  order_count: number
  product_count: number
  low_stock_count: number
}

// Client-side only cart types (never sent as prices to the server).
export interface CartItem {
  product_id: number
  name: string
  price: number
  image_url: string
  quantity: number
  stock_quantity: number
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[]
  message?: string
}
