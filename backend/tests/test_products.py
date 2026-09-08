def test_list_products_public(client, product):
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["slug"] == "test-widget" for item in data["items"])


def test_admin_can_create_product(client, auth_headers_admin, category):
    response = client.post(
        "/api/products",
        headers=auth_headers_admin,
        json={
            "name": "New Gadget",
            "slug": "new-gadget",
            "description": "Shiny.",
            "price": "29.99",
            "stock_quantity": 5,
            "category_id": category.id,
            "image_url": "https://images.unsplash.com/photo-gadget",
        },
    )
    assert response.status_code == 201
    assert response.json()["slug"] == "new-gadget"


def test_customer_cannot_create_product(client, auth_headers_customer, category):
    response = client.post(
        "/api/products",
        headers=auth_headers_customer,
        json={
            "name": "Forbidden Gadget",
            "slug": "forbidden-gadget",
            "price": "9.99",
            "stock_quantity": 1,
            "category_id": category.id,
        },
    )
    assert response.status_code == 403


def test_customer_cannot_delete_product(client, auth_headers_customer, product):
    response = client.delete(f"/api/products/{product.id}", headers=auth_headers_customer)
    assert response.status_code == 403


def test_admin_delete_product_is_soft_delete(client, auth_headers_admin, product):
    response = client.delete(f"/api/products/{product.id}", headers=auth_headers_admin)
    assert response.status_code == 204

    # Soft-deleted products should no longer show up in the public listing.
    list_resp = client.get("/api/products")
    slugs = [item["slug"] for item in list_resp.json()["items"]]
    assert "test-widget" not in slugs

    # But the row itself must still exist (fetchable by id, e.g. for admin views).
    get_resp = client.get(f"/api/products/{product.id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["is_active"] is False


def test_admin_can_update_product(client, auth_headers_admin, product):
    response = client.put(
        f"/api/products/{product.id}",
        headers=auth_headers_admin,
        json={"price": "24.99", "stock_quantity": 50},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 24.99
    assert data["stock_quantity"] == 50


def test_admin_stats_forbidden_for_customer(client, auth_headers_customer):
    response = client.get("/api/admin/stats", headers=auth_headers_customer)
    assert response.status_code == 403


def test_admin_stats_ok_for_admin(client, auth_headers_admin, product):
    response = client.get("/api/admin/stats", headers=auth_headers_admin)
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "product_count" in data
