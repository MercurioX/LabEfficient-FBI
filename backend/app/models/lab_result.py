from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True)
    lab_id = Column(Integer, ForeignKey("labs.id"))
    canonical_name = Column(String, nullable=True)
    original_name = Column(String)
    value_numeric = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    ref_text = Column(String, nullable=True)
    is_high = Column(Boolean, default=False)
    is_low = Column(Boolean, default=False)
    is_out_of_range = Column(Boolean, default=False)
    confidence = Column(String, default="high")
    is_corrected = Column(Boolean, default=False)
    corrected_by = Column(String, nullable=True)
    corrected_at = Column(DateTime, nullable=True)
    display_order = Column(Integer, nullable=True)
    category = Column(String, nullable=True)

    lab = relationship("Lab", back_populates="results")
