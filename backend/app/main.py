from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, auth, categories, orders, products

app = FastAPI(title="E-commerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router_prefix = "/api"

app.include_router(auth.router, prefix=api_router_prefix)
app.include_router(categories.router, prefix=api_router_prefix)
app.include_router(products.router, prefix=api_router_prefix)
app.include_router(orders.router, prefix=api_router_prefix)
app.include_router(admin.router, prefix=api_router_prefix)


@app.get("/api/health", tags=["ops"])
def health_check():
    return {"status": "ok"}
