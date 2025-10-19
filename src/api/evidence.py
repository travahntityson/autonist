# src/api/evidence.py
# Handles control evidence ingestion for AutoNIST Core.
# Supports continuous monitoring under NIST SP 800-137.

from fastapi import APIRouter, HTTPException
from datetime import datetime
from src.services.crypto import fips_hash

router = APIRouter()

@router.post("/ingest")
def ingest_evidence(control_id: str, source: str, value: dict):
    """
    Accepts evidence data from Local System Agents (LSAs) or other collectors.
    Each submission is timestamped, hashed for integrity, and logged.
    In a production system this would be written to the Evidence database table.
    """

    try:
        timestamp = datetime.utcnow().isoformat() + "Z"
        evidence_data = {
            "control_id": control_id,
            "source": source,
            "value": value,
            "timestamp": timestamp
        }

        # Compute integrity hash for verification
        evidence_hash = fips_hash(str(evidence_data).encode())

        # In production, insert into database here.
        # For now, just return the hashed payload.
        return {
            "status": "evidence_received",
            "control_id": control_id,
            "source": source,
            "timestamp": timestamp,
            "hash": evidence_hash
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
