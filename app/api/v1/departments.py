from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from typing import List

from app.api.dependencies import DbSession, AdminUser, CurrentUser
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse

router = APIRouter()

@router.post("/", response_model=DepartmentResponse)
async def create_department(dept_in: DepartmentCreate, db: DbSession, admin: AdminUser):
    result = await db.execute(select(Department).where(Department.name == dept_in.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Department with this name already exists")
        
    new_dept = Department(**dept_in.model_dump())
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept

@router.get("/", response_model=List[DepartmentResponse])
async def read_departments(db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Department).where(Department.is_active == True))
    return result.scalars().all()

@router.put("/{dept_id}", response_model=DepartmentResponse)
async def update_department(dept_id: int, dept_in: DepartmentUpdate, db: DbSession, admin: AdminUser):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    update_data = dept_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dept, field, value)
        
    await db.commit()
    await db.refresh(dept)
    return dept

@router.delete("/{dept_id}")
async def delete_department(dept_id: int, db: DbSession, admin: AdminUser):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    dept.is_active = False # Soft delete
    await db.commit()
    return {"message": "Department deactivated"}
