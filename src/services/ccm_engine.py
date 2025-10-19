# src/services/ccm_engine.py
# Continuous Control Monitoring (CCM) Engine for AutoNIST Core.
# Evaluates control evidence against predefined rule sets and assigns compliance status.

import json
from datetime import datetime
from src.services.crypto import fips_hash

# Example baseline rules.
# In production, these will be loaded from YAML files in /src/rules/.
RULE_SETS = {
    "AC-2": {
        "description": "Account Management — Verify user account count is within approved baseline.",
        "condition": lambda value: value.get("user_count", 0) <= 100,
        "risk_level": "Moderate"
    },
    "CM-6": {
        "description": "Configuration Settings — Ensure critical settings match the baseline.",
        "condition": lambda value: value.get("baseline_match", False) is True,
        "risk_level": "High"
    }
}


def evaluate_control(control_id: str, evidence_value: dict) -> dict:
    """
    Evaluates a control's evidence against its defined rule.
    Returns a standardized evaluation record with a hash and timestamp.
    """

    timestamp = datetime.utcnow().isoformat() + "Z"
    rule = RULE_SETS.get(control_id)

    if not rule:
        status = "Unknown"
        finding = f"No rule defined for control {control_id}"
    else:
        # Apply rule logic safely
        try:
            if rule["condition"](evidence_value):
                status = "Compliant"
                finding = "Control meets criteria."
            else:
                status = "Non-Compliant"
                finding = "Control failed evaluation rule."
        except Exception as e:
            status = "Error"
            finding = str(e)

    evaluation_record = {
        "control_id": control_id,
        "timestamp": timestamp,
        "status": status,
        "finding": finding,
        "risk_level": rule["risk_level"] if rule else "N/A",
        "hash": fips_hash(json.dumps(evidence_value).encode())
    }

    return evaluation_record


def evaluate_batch(evidence_list: list) -> list:
    """
    Evaluates a list of evidence items in batch.
    Used for daily or scheduled continuous monitoring runs.
    """
    results = []
    for e in evidence_list:
        result = evaluate_control(e.get("control_id"), e.get("value", {}))
        results.append(result)
    return results
