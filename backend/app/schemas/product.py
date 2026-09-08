from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryOut


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    price: Decimal
    stock_quantity: int = 0
    category_id: int | None = None
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    price: Decimal | None = None
    stock_quantity: int | None = None
    category_id: int | None = None
    image_url: str | None = None
    is_active: bool | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    price: float
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None
    category: CategoryOut | None = None


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int
