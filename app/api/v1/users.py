from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.api.dependencies import DbSession, AdminUser, CurrentUser
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(user_in: UserCreate, db: DbSession, admin: AdminUser):
    # Check if username or email exists
    result = await db.execute(
        select(User).where((User.username == user_in.username) | (User.email == user_in.email))
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        is_active=user_in.is_active
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/", response_model=List[UserResponse])
async def read_users(db: DbSession, admin: AdminUser):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: CurrentUser):
    return current_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, user_in: UserUpdate, db: DbSession, admin: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
        
    for field, value in update_data.items():
        setattr(user, field, value)
        
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: UUID, db: DbSession, admin: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = False # Soft delete
    await db.commit()
    return {"message": "User deactivated"}
