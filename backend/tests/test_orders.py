SHIPPING_PAYLOAD = {
    "shipping_full_name": "Jane Doe",
    "shipping_address_line1": "123 Main St",
    "shipping_city": "Metropolis",
    "shipping_postal_code": "12345",
    "shipping_country": "USA",
}


def test_checkout_decrements_stock_and_computes_total_server_side(
    client, auth_headers_customer, product
):
    starting_stock = product.stock_quantity

    payload = {
        "items": [{"product_id": product.id, "quantity": 3, "price": "0.01"}],
        **SHIPPING_PAYLOAD,
    }
    response = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    assert response.status_code == 201
    data = response.json()

    # Total must be computed from the live product price (19.99 * 3), never
    # from the bogus client-submitted "price" field above.
    assert data["total_amount"] == 59.97
    assert data["items"][0]["unit_price_snapshot"] == 19.99
    assert data["items"][0]["product_name_snapshot"] == "Test Widget"

    product_resp = client.get(f"/api/products/{product.id}")
    assert product_resp.json()["stock_quantity"] == starting_stock - 3


def test_checkout_with_insufficient_stock_fails_cleanly(
    client, auth_headers_customer, low_stock_product
):
    payload = {
        "items": [{"product_id": low_stock_product.id, "quantity": 5}],
        **SHIPPING_PAYLOAD,
    }
    response = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    assert response.status_code == 400

    # Stock must be untouched after a failed checkout.
    product_resp = client.get(f"/api/products/{low_stock_product.id}")
    assert product_resp.json()["stock_quantity"] == 1


def test_checkout_partial_failure_does_not_partially_decrement_stock(
    client, auth_headers_customer, product, low_stock_product
):
    """One item has enough stock, the other doesn't -- neither should be decremented."""
    payload = {
        "items": [
            {"product_id": product.id, "quantity": 2},
            {"product_id": low_stock_product.id, "quantity": 99},
        ],
        **SHIPPING_PAYLOAD,
    }
    response = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    assert response.status_code == 400

    product_resp = client.get(f"/api/products/{product.id}")
    assert product_resp.json()["stock_quantity"] == 10

    low_stock_resp = client.get(f"/api/products/{low_stock_product.id}")
    assert low_stock_resp.json()["stock_quantity"] == 1


def test_customer_can_view_own_order_but_not_others(
    client, db_session, auth_headers_customer, auth_headers_admin, product
):
    payload = {
        "items": [{"product_id": product.id, "quantity": 1}],
        **SHIPPING_PAYLOAD,
    }
    create_resp = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    order_id = create_resp.json()["id"]

    own_resp = client.get(f"/api/orders/{order_id}", headers=auth_headers_customer)
    assert own_resp.status_code == 200

    admin_resp = client.get(f"/api/orders/{order_id}", headers=auth_headers_admin)
    assert admin_resp.status_code == 200


def test_admin_can_update_order_status(client, auth_headers_customer, auth_headers_admin, product):
    payload = {
        "items": [{"product_id": product.id, "quantity": 1}],
        **SHIPPING_PAYLOAD,
    }
    create_resp = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    order_id = create_resp.json()["id"]

    update_resp = client.patch(
        f"/api/orders/{order_id}/status",
        headers=auth_headers_admin,
        json={"status": "shipped"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "shipped"


def test_customer_cannot_update_order_status(client, auth_headers_customer, product):
    payload = {
        "items": [{"product_id": product.id, "quantity": 1}],
        **SHIPPING_PAYLOAD,
    }
    create_resp = client.post("/api/orders", headers=auth_headers_customer, json=payload)
    order_id = create_resp.json()["id"]

    update_resp = client.patch(
        f"/api/orders/{order_id}/status",
        headers=auth_headers_customer,
        json={"status": "shipped"},
    )
    assert update_resp.status_code == 403
