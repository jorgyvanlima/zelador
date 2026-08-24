from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.api.dependencies import DbSession, CurrentUser
from app.models.visit import Visit, VisitStatus
from app.models.visitor import Visitor
from app.models.department import Department
from app.schemas.visit import VisitCreate, VisitResponse

router = APIRouter()

@router.post("/check-in", response_model=VisitResponse)
async def check_in(visit_in: VisitCreate, db: DbSession, current_user: CurrentUser):
    # Verify visitor exists
    v_res = await db.execute(select(Visitor).where(Visitor.id == visit_in.visitor_id))
    if not v_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Visitor not found")
        
    # Verify department exists
    d_res = await db.execute(select(Department).where(Department.id == visit_in.department_id))
    if not d_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Department not found")
        
    # Verify if visitor is already inside
    active_visit_res = await db.execute(
        select(Visit).where((Visit.visitor_id == visit_in.visitor_id) & (Visit.status == VisitStatus.INSIDE))
    )
    if active_visit_res.scalars().first():
        raise HTTPException(status_code=400, detail="Visitor is already inside")

    new_visit = Visit(
        visitor_id=visit_in.visitor_id,
        department_id=visit_in.department_id,
        registered_by_user_id=current_user.id,
        entry_datetime=datetime.now(timezone.utc),
        purpose=visit_in.purpose,
        observation=visit_in.observation,
        status=VisitStatus.INSIDE
    )
    db.add(new_visit)
    await db.commit()
    await db.refresh(new_visit)
    return new_visit

@router.post("/{visit_id}/check-out", response_model=VisitResponse)
async def check_out(visit_id: UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Visit).where(Visit.id == visit_id))
    visit = result.scalar_one_or_none()
    
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    if visit.status == VisitStatus.EXITED:
        raise HTTPException(status_code=400, detail="Visit already checked out")
        
    visit.exit_datetime = datetime.now(timezone.utc)
    visit.status = VisitStatus.EXITED
    await db.commit()
    await db.refresh(visit)
    return visit

@router.get("/active", response_model=List[VisitResponse])
async def get_active_visits(db: DbSession, current_user: CurrentUser):
    # Pode incluir os dados do visitante usando joinedload se desejar retornar mais infos,
    # Mas como o schema atual apenas retorna os IDs, vamos focar no base:
    result = await db.execute(select(Visit).where(Visit.status == VisitStatus.INSIDE))
    return result.scalars().all()
