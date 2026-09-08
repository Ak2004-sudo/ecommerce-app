from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import (
    AdminStatsOut,
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    # Lock the relevant product rows for the duration of the transaction so
    # concurrent checkouts can't both pass the stock check for the same stock.
    product_ids = [item.product_id for item in payload.items]
    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    )
    products_by_id = {p.id: p for p in products}

    # Validate everything first -- no mutation happens until all items pass.
    for item in payload.items:
        product = products_by_id.get(item.product_id)
        if product is None or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product_id} is not available",
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'",
            )

    order_items: list[OrderItem] = []
    total_amount = Decimal("0")

    for item in payload.items:
        product = products_by_id[item.product_id]
        unit_price = product.price
        subtotal = unit_price * item.quantity
        total_amount += subtotal

        product.stock_quantity -= item.quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name_snapshot=product.name,
                unit_price_snapshot=unit_price,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )

    order = Order(
        user_id=current_user.id,
        status=OrderStatus.paid,
        total_amount=total_amount,
        shipping_full_name=payload.shipping_full_name,
        shipping_address_line1=payload.shipping_address_line1,
        shipping_address_line2=payload.shipping_address_line2,
        shipping_city=payload.shipping_city,
        shipping_state=payload.shipping_state,
        shipping_postal_code=payload.shipping_postal_code,
        shipping_country=payload.shipping_country,
        items=order_items,
    )

    try:
        db.add(order)
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


@router.get("/me", response_model=list[OrderOut])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("", response_model=list[OrderOut])
def list_all_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter is not None:
        query = query.filter(Order.status == status_filter)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this order")

    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
