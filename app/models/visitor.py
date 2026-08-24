import uuid
import enum
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class DocumentType(str, enum.Enum):
    CPF = "CPF"
    RG = "RG"
    OAB = "OAB"
    OUTRO = "OUTRO"

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String, unique=True, index=True, nullable=False)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
