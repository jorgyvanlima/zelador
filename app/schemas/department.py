from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    floor: Optional[str] = None
    building: Optional[str] = None
    responsible_person: Optional[str] = None
    is_active: Optional[bool] = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    name: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int

    model_config = {"from_attributes": True}
