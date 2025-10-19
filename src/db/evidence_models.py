# src/db/evidence_models.py
# Defines the Evidence table for AutoNIST Core.
# Stores control evidence and integrity hashes for continuous monitoring.

from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Evidence(Base):
    """
    Represents a single piece of control evidence.
    Each record ties to a NIST control (e.g., AC-2) and
    includes metadata for traceability and verification.
    """

    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    control_id = Column(String, nullable=False)      # e.g. AC-2, CM-6
    source = Column(String, nullable=False)          # System, agent, or tool
    value = Column(JSON, nullable=False)             # Raw metric or observation
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Pending")       # Pending / Validated / Non-Compliant
    hash = Column(String, nullable=False)            # Integrity verification hash
