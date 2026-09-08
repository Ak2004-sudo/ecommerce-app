from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import AdminStatsOut

router = APIRouter(prefix="/admin", tags=["admin"])

LOW_STOCK_THRESHOLD = 5


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status != OrderStatus.cancelled)
        .scalar()
    )
    order_count = db.query(func.count(Order.id)).scalar()
    product_count = db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar()
    low_stock_count = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True), Product.stock_quantity <= LOW_STOCK_THRESHOLD)
        .scalar()
    )

    return AdminStatsOut(
        revenue=Decimal(revenue or 0),
        order_count=order_count or 0,
        product_count=product_count or 0,
        low_stock_count=low_stock_count or 0,
    )
