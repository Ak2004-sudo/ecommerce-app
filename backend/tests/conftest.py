import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.security import hash_password
from app.database import Base, get_db
from app.main import app
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_user(db_session):
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Test Admin",
        role=UserRole.admin,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def customer_user(db_session):
    user = User(
        email="customer@test.com",
        hashed_password=hash_password("CustomerPass123!"),
        full_name="Test Customer",
        role=UserRole.customer,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def admin_token(client, admin_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"},
    )
    return response.json()["access_token"]


@pytest.fixture()
def customer_token(client, customer_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "customer@test.com", "password": "CustomerPass123!"},
    )
    return response.json()["access_token"]


@pytest.fixture()
def auth_headers_admin(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def auth_headers_customer(customer_token):
    return {"Authorization": f"Bearer {customer_token}"}


@pytest.fixture()
def category(db_session):
    cat = Category(name="Electronics", slug="electronics")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)
    return cat


@pytest.fixture()
def product(db_session, category):
    prod = Product(
        name="Test Widget",
        slug="test-widget",
        description="A widget for testing.",
        price="19.99",
        stock_quantity=10,
        category_id=category.id,
        image_url="https://images.unsplash.com/photo-test",
        is_active=True,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod


@pytest.fixture()
def low_stock_product(db_session, category):
    prod = Product(
        name="Scarce Widget",
        slug="scarce-widget",
        description="Only one left.",
        price="9.99",
        stock_quantity=1,
        category_id=category.id,
        image_url="https://images.unsplash.com/photo-scarce",
        is_active=True,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod
