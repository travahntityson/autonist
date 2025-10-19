# src/db/models.py
# Defines AutoNIST Core database tables using SQLAlchemy ORM.

from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

# Create the SQLAlchemy base class
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)   # e.g. ISSM, Analyst, Auditor
    hashed_pw = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to audit logs
    audit_logs = relationship("AuditLog", back_populates="user")

class Control(Base):
    __tablename__ = "controls"

    id = Column(Integer, primary_key=True)
    control_id = Column(String, unique=True, nullable=False)
    family = Column(String, nullable=False)
    oscal_json = Column(JSON, nullable=True)  # Machine-readable OSCAL data
    status = Column(String, default="Planned")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    hash = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
1
