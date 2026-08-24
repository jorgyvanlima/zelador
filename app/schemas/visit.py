from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.visit import VisitStatus

class VisitBase(BaseModel):
    visitor_id: UUID
    department_id: int
    purpose: Optional[str] = None
    observation: Optional[str] = None

class VisitCreate(VisitBase):
    pass

class VisitResponse(VisitBase):
    id: UUID
    registered_by_user_id: UUID
    entry_datetime: datetime
    exit_datetime: Optional[datetime] = None
    status: VisitStatus

    model_config = {"from_attributes": True}
