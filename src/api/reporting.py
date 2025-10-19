# src/api/reporting.py
# AutoNIST Core Reporting API
# Summarizes control evaluations, POA&M entries, and overall compliance metrics.

from fastapi import APIRouter
from src.services.ccm_engine import evaluate_batch
from src.services.poam_generator import list_poam_entries

router = APIRouter()

@router.post("/report/summary")
def generate_report(evidence_batch: list):
    """
    Accepts a batch of evidence for evaluation, then returns:
    - Compliance breakdown (Compliant / Non-Compliant / Unknown)
    - Risk-level summary
    - All open POA&M entries
    """

    evaluations = evaluate_batch(evidence_batch)
    summary = summarize_results(evaluations)
    poam = list_poam_entries()

    return {
        "summary": summary,
        "evaluations": evaluations,
        "poam_entries": poam
    }


def summarize_results(evaluations):
    """
    Builds high-level compliance and risk summaries for visualization dashboards.
    """

    counts = {"Compliant": 0, "Non-Compliant": 0, "Unknown": 0, "Error": 0}
    risks = {"High": 0, "Moderate": 0, "Low": 0, "N/A": 0}

    for eval in evaluations:
        counts[eval["status"]] = counts.get(eval["status"], 0) + 1
        risks[eval.get("risk_level", "N/A")] = risks.get(eval.get("risk_level", "N/A"), 0) + 1

    total = sum(counts.values()) or 1
    compliance_pct = round((counts["Compliant"] / total) * 100, 2)

    return {
        "total_controls": total,
        "compliance_rate": f"{compliance_pct}%",
        "status_breakdown": counts,
        "risk_summary": risks
    }
