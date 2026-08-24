import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class VisitStatus(str, enum.Enum):
    INSIDE = "INSIDE"
    EXITED = "EXITED"

class Visit(Base):
    __tablename__ = "visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    registered_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    entry_datetime = Column(DateTime(timezone=True), nullable=False)
    exit_datetime = Column(DateTime(timezone=True), nullable=True)
    
    purpose = Column(Text, nullable=True)
    observation = Column(Text, nullable=True)
    status = Column(Enum(VisitStatus), default=VisitStatus.INSIDE, nullable=False)

    visitor = relationship("Visitor")
    department = relationship("Department")
    registered_by = relationship("User")
