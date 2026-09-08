"""Seed the database with a demo admin account, categories, and sample products.

Run with:  python -m app.seed

Demo admin login (for portfolio/demo purposes only):
    email:    admin@demo.com
    password: Admin123!

Demo customer accounts are not seeded — register a new customer account
through POST /api/auth/register to try the customer flow.
"""

from app.auth.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole

ADMIN_EMAIL = "admin@demo.com"
ADMIN_PASSWORD = "Admin123!"

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics"},
    {"name": "Clothing", "slug": "clothing"},
    {"name": "Home & Kitchen", "slug": "home-kitchen"},
    {"name": "Books", "slug": "books"},
    {"name": "Sports & Outdoors", "slug": "sports-outdoors"},
]

PRODUCTS = [
    # Electronics
    {
        "name": "Wireless Over-Ear Headphones",
        "slug": "wireless-over-ear-headphones",
        "description": "Noise-cancelling wireless headphones with 30-hour battery life.",
        "price": "89.99",
        "stock_quantity": 40,
        "category_slug": "electronics",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Smartwatch Series 5",
        "slug": "smartwatch-series-5",
        "description": "Fitness tracking smartwatch with heart-rate monitor and GPS.",
        "price": "149.99",
        "stock_quantity": 25,
        "category_slug": "electronics",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Portable Bluetooth Speaker",
        "slug": "portable-bluetooth-speaker",
        "description": "Compact waterproof speaker with rich bass and 12-hour playtime.",
        "price": "39.99",
        "stock_quantity": 60,
        "category_slug": "electronics",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Mechanical Keyboard",
        "slug": "mechanical-keyboard",
        "description": "RGB backlit mechanical keyboard with tactile switches.",
        "price": "74.99",
        "stock_quantity": 3,
        "category_slug": "electronics",
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "4K Action Camera",
        "slug": "4k-action-camera",
        "description": "Rugged waterproof action camera with image stabilization.",
        "price": "129.99",
        "stock_quantity": 18,
        "category_slug": "electronics",
        "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    },
    # Clothing
    {
        "name": "Classic Denim Jacket",
        "slug": "classic-denim-jacket",
        "description": "Timeless denim jacket with a relaxed fit.",
        "price": "59.99",
        "stock_quantity": 35,
        "category_slug": "clothing",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Running Sneakers",
        "slug": "running-sneakers",
        "description": "Lightweight breathable sneakers built for daily runs.",
        "price": "84.99",
        "stock_quantity": 50,
        "category_slug": "clothing",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Merino Wool Sweater",
        "slug": "merino-wool-sweater",
        "description": "Soft, breathable merino wool sweater for cool weather.",
        "price": "69.99",
        "stock_quantity": 4,
        "category_slug": "clothing",
        "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
    # Home & Kitchen
    {
        "name": "Stainless Steel French Press",
        "slug": "stainless-steel-french-press",
        "description": "Double-wall insulated French press for rich, hot coffee.",
        "price": "34.99",
        "stock_quantity": 45,
        "category_slug": "home-kitchen",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Non-Stick Cookware Set",
        "slug": "non-stick-cookware-set",
        "description": "10-piece non-stick cookware set for everyday cooking.",
        "price": "119.99",
        "stock_quantity": 15,
        "category_slug": "home-kitchen",
        "image_url": "https://images.unsplash.com/photo-1584990347449-a0d51d5c9b6a?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Ceramic Dinnerware Set",
        "slug": "ceramic-dinnerware-set",
        "description": "16-piece ceramic dinnerware set, dishwasher safe.",
        "price": "79.99",
        "stock_quantity": 2,
        "category_slug": "home-kitchen",
        "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    },
    # Books
    {
        "name": "The Pragmatic Programmer",
        "slug": "the-pragmatic-programmer",
        "description": "A classic guide to becoming a more effective software developer.",
        "price": "42.00",
        "stock_quantity": 30,
        "category_slug": "books",
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Atomic Habits",
        "slug": "atomic-habits",
        "description": "An easy and proven way to build good habits and break bad ones.",
        "price": "18.99",
        "stock_quantity": 55,
        "category_slug": "books",
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    # Sports & Outdoors
    {
        "name": "Yoga Mat Pro",
        "slug": "yoga-mat-pro",
        "description": "Extra-thick non-slip yoga mat with carrying strap.",
        "price": "29.99",
        "stock_quantity": 70,
        "category_slug": "sports-outdoors",
        "image_url": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Insulated Water Bottle",
        "slug": "insulated-water-bottle",
        "description": "Vacuum-insulated stainless steel bottle, keeps drinks cold 24h.",
        "price": "24.99",
        "stock_quantity": 5,
        "category_slug": "sports-outdoors",
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                full_name="Demo Admin",
                role=UserRole.admin,
            )
            db.add(admin_user)
            print(f"Created admin user: {ADMIN_EMAIL}")
        else:
            print(f"Admin user already exists: {ADMIN_EMAIL}")

        category_by_slug: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not category:
                category = Category(**cat_data)
                db.add(category)
                db.flush()
                print(f"Created category: {cat_data['name']}")
            category_by_slug[cat_data["slug"]] = category

        db.commit()

        for product_data in PRODUCTS:
            existing = db.query(Product).filter(Product.slug == product_data["slug"]).first()
            if existing:
                continue

            category_slug = product_data.pop("category_slug")
            category = category_by_slug[category_slug]
            product = Product(category_id=category.id, **product_data)
            db.add(product)
            print(f"Created product: {product_data['name']}")

        db.commit()
        print("Seeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
