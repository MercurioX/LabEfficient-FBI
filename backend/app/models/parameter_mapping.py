from sqlalchemy import Column, Integer, String
from app.core.database import Base


class ParameterMapping(Base):
    __tablename__ = "parameter_mappings"

    id = Column(Integer, primary_key=True)
    alias = Column(String, unique=True, index=True)
    canonical_name = Column(String)
    category = Column(String)
    default_unit = Column(String, nullable=True)
