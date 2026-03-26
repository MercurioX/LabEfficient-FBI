from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Lab(Base):
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("import_batches.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    external_lab_name = Column(String, nullable=True)
    sample_date = Column(Date, nullable=True)
    upload_filename = Column(String)
    source_pdf_path = Column(String)
    processing_status = Column(String, default="queued")
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String, nullable=True)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    error_message = Column(String, nullable=True)  # befüllt wenn status='failed'

    batch = relationship("ImportBatch", back_populates="labs")
    patient = relationship("Patient", back_populates="labs")
    results = relationship("LabResult", back_populates="lab", cascade="all, delete-orphan")
