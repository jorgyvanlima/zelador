from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.api.dependencies import DbSession, CurrentUser
from app.models.visitor import Visitor
from app.schemas.visitor import VisitorCreate, VisitorUpdate, VisitorResponse
from app.services.upload_service import save_visitor_photo

router = APIRouter()

@router.post("/", response_model=VisitorResponse)
async def create_visitor(visitor_in: VisitorCreate, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Visitor).where(Visitor.document_number == visitor_in.document_number))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Visitor with this document number already exists")
        
    new_visitor = Visitor(**visitor_in.model_dump())
    db.add(new_visitor)
    await db.commit()
    await db.refresh(new_visitor)
    return new_visitor

@router.get("/{document_number}", response_model=VisitorResponse)
async def get_visitor_by_doc(document_number: str, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Visitor).where(Visitor.document_number == document_number))
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor

@router.post("/{visitor_id}/photo", response_model=VisitorResponse)
async def upload_visitor_photo(visitor_id: UUID, file: UploadFile, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
        
    try:
        photo_url = await save_visitor_photo(str(visitor.id), file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    visitor.photo_url = photo_url
    await db.commit()
    await db.refresh(visitor)
    return visitor
