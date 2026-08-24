import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

from app.core.config import settings
from app.db.base import Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models import * # Import to ensure all models are registered with Base

async def init_db():
    print("Creating tables...")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Seeding database...")
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Check if admin exists
        result = await session.execute(select(User).where(User.username == "admin"))
        user = result.scalar_one_or_none()
        if not user:
            print("Creating initial admin user...")
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                username="admin",
                email="admin@zelador.com",
                hashed_password=hashed_password,
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            print("Admin user created successfully: admin / admin123")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    asyncio.run(init_db())
