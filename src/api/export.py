# src/api/export.py
# Exposes endpoints to export OSCAL SSP and POA&M XML files.

from fastapi import APIRouter
from src.services.oscal_exporter import export_ssp, export_poam
from src.services.ccm_engine import evaluate_batch
from src.services.poam_generator import list_poam_entries

router = APIRouter()

@router.post("/export/sspxml")
def generate_ssp(evidence_batch: list):
    """Generates an OSCAL SSP XML from provided evaluation data."""
    evaluations = evaluate_batch(evidence_batch)
    path = export_ssp(evaluations)
    return {"message": "SSP exported", "file_path": path}

@router.get("/export/poamxml")
def generate_poam():
    """Generates an OSCAL POA&M XML snapshot from existing POA&M entries."""
    path = export_poam()
    return {"message": "POA&M exported", "file_path": path}
