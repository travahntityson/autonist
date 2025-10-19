# src/main.py
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from src.api import audit, evidence, reporting
from src.services.poam_generator import list_poam_entries

app = FastAPI(title="AutoNIST Core API", version="1.0.0")
templates = Jinja2Templates(directory="src/templates")

# Include existing API routers
app.include_router(audit.router)
app.include_router(evidence.router)
app.include_router(reporting.router)

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Render compliance summary dashboard."""
    # For demo purposes, call the reporting summary endpoint directly
    dummy_evidence = []   # could later be replaced with real DB pull
    summary_data = {
        "total_controls": 10,
        "compliance_rate": "80%",
        "risk_summary": {"High": 1, "Moderate": 2, "Low": 7, "N/A": 0}
    }
    poam = list_poam_entries()
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "summary": summary_data, "poam": poam}
    )
