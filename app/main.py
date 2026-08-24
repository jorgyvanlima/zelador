from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.departments import router as departments_router
from app.api.v1.visitors import router as visitors_router
from app.api.v1.visits import router as visits_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
app.include_router(departments_router, prefix=f"{settings.API_V1_STR}/departments", tags=["Departments"])
app.include_router(visitors_router, prefix=f"{settings.API_V1_STR}/visitors", tags=["Visitors"])
app.include_router(visits_router, prefix=f"{settings.API_V1_STR}/visits", tags=["Visits"])

@app.get("/")
def root():
    return {"message": "Bem-vindo à API do Zelador"}
