from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_full_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None = None
    shipping_city: str
    shipping_state: str | None = None
    shipping_postal_code: str
    shipping_country: str


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name_snapshot: str
    unit_price_snapshot: float
    quantity: int
    subtotal: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    shipping_full_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None = None
    shipping_city: str
    shipping_state: str | None = None
    shipping_postal_code: str
    shipping_country: str
    created_at: datetime
    updated_at: datetime | None = None
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class AdminStatsOut(BaseModel):
    revenue: float
    order_count: int
    product_count: int
    low_stock_count: int
