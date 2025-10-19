# src/main.py
# AutoNIST Core main application — now with dynamic dashboard

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pathlib import Path
import json

from src.api import audit, evidence, reporting
from src.services.ccm_engine import evaluate_batch
from src.services.poam_generator import create_poam_entry, list_poam_entries

app = FastAPI(title="AutoNIST Core API", version="1.0.0")
templates = Jinja2Templates(directory="src/templates")

# Register API routers
app.include_router(audit.router)
app.include_router(evidence.router)
app.include_router(reporting.router)
from src.api import export
app.include_router(export.router)

DATA_DIR = Path("data/evidence")
DATA_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """
    Dynamic dashboard:
    - Loads all JSON evidence files from /data/evidence
    - Evaluates controls via CCM engine
    - Auto-generates POA&M entries for non-compliant controls
    - Displays compliance and risk summaries
    """

    evidence_batch = load_all_evidence()
    evaluations = evaluate_batch(evidence_batch)

    # Auto-create POA&M entries for failing controls
    for record in evaluations:
        if record["status"] == "Non-Compliant":
            create_poam_entry(record)

    # Calculate summary metrics dynamically
    summary = summarize_results(evaluations)
    poam = list_poam_entries()

    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "summary": summary, "poam": poam}
    )


def load_all_evidence():
    """Reads all evidence JSON files from /data/evidence/."""
    evidence_files = list(DATA_DIR.glob("*.json"))
    evidence_list = []
    for f in evidence_files:
        try:
            with open(f, "r", encoding="utf-8") as infile:
                evidence_list.append(json.load(infile))
        except Exception:
            continue
    return evidence_list


def summarize_results(evaluations):
    """Aggregate compliance statistics for dashboard view."""
    counts = {"Compliant": 0, "Non-Compliant": 0, "Unknown": 0, "Error": 0}
    risks = {"High": 0, "Moderate": 0, "Low": 0, "N/A": 0}

    for record in evaluations:
        counts[record["status"]] = counts.get(record["status"], 0) + 1
        risks[record.get("risk_level", "N/A")] = risks.get(record.get("risk_level", "N/A"), 0) + 1

    total = sum(counts.values()) or 1
    compliance_pct = round((counts["Compliant"] / total) * 100, 2)

    return {
        "total_controls": total,
        "compliance_rate": f"{compliance_pct}%",
        "status_breakdown": counts,
        "risk_summary": risks,
    }
