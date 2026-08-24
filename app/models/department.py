from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    floor = Column(String, nullable=True)
    building = Column(String, nullable=True)
    responsible_person = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
