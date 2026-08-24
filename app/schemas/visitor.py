from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.visitor import DocumentType

class VisitorBase(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    document_type: DocumentType
    document_number: str = Field(..., description="Document number, digits or standard formatting")

class VisitorCreate(VisitorBase):
    pass

class VisitorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    document_type: Optional[DocumentType] = None
    document_number: Optional[str] = None

class VisitorResponse(VisitorBase):
    id: UUID
    photo_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
