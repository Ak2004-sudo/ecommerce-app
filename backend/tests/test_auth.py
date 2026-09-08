def test_register_creates_customer_role_even_if_role_field_sent(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "SomePass123!",
            "full_name": "New User",
            "role": "admin",  # should be ignored by the API
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "customer"


def test_register_then_login_happy_path(client):
    register_resp = client.post(
        "/api/auth/register",
        json={
            "email": "loginflow@test.com",
            "password": "SomePass123!",
            "full_name": "Login Flow",
        },
    )
    assert register_resp.status_code == 201

    login_resp = client.post(
        "/api/auth/login",
        json={"email": "loginflow@test.com", "password": "SomePass123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token

    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "loginflow@test.com"


def test_login_with_wrong_password_fails(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "wrongpass@test.com",
            "password": "CorrectPass123!",
            "full_name": "Wrong Pass",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrongpass@test.com", "password": "IncorrectPass"},
    )
    assert response.status_code == 401


def test_duplicate_email_registration_rejected(client):
    payload = {
        "email": "dupe@test.com",
        "password": "SomePass123!",
        "full_name": "Dupe User",
    }
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/auth/register", json=payload)
    assert second.status_code == 400
