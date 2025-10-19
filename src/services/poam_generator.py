# src/services/poam_generator.py
# AutoNIST Core - POA&M Generator
# Automatically creates and manages Plan of Action & Milestones entries
# when controls fail CCM evaluation.

import json
from datetime import datetime
from hashlib import sha384
from pathlib import Path

POAM_DIR = Path("data/poam")
POAM_DIR.mkdir(parents=True, exist_ok=True)

def create_poam_entry(evaluation_record: dict) -> dict:
    """
    Generates a POA&M entry when a control fails evaluation.
    Each entry is stored as a JSON file and assigned a unique identifier.
    """

    if evaluation_record.get("status") != "Non-Compliant":
        # No POA&M entry needed for compliant or unknown results.
        return None

    control_id = evaluation_record.get("control_id")
    finding = evaluation_record.get("finding", "No finding description.")
    risk_level = evaluation_record.get("risk_level", "Unknown")
    timestamp = datetime.utcnow().isoformat() + "Z"

    poam_id = sha384(f"{control_id}{timestamp}".encode()).hexdigest()[:12]

    poam_entry = {
        "poam_id": poam_id,
        "control_id": control_id,
        "finding": finding,
        "risk_level": risk_level,
        "status": "Open",
        "mitigation": "Pending review and corrective action",
        "created_at": timestamp,
        "last_updated": timestamp
    }

    file_path = POAM_DIR / f"{control_id}_{poam_id}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(poam_entry, f, indent=2)

    return poam_entry


def update_poam_status(poam_id: str, new_status: str):
    """
    Updates the status of a POA&M entry to Closed, In Progress, etc.
    """

    for file in POAM_DIR.glob("*.json"):
        with open(file, "r+", encoding="utf-8") as f:
            entry = json.load(f)
            if entry.get("poam_id") == poam_id:
                entry["status"] = new_status
                entry["last_updated"] = datetime.utcnow().isoformat() + "Z"
                f.seek(0)
                f.truncate()
                json.dump(entry, f, indent=2)
                return entry
    return None


def list_poam_entries():
    """
    Lists all POA&M entries currently tracked by the system.
    """
    entries = []
    for file in POAM_DIR.glob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            entries.append(json.load(f))
    return entries


if __name__ == "__main__":
    # Example standalone test (for developers)
    sample_eval = {
        "control_id": "CM-6",
        "status": "Non-Compliant",
        "finding": "Configuration baseline mismatch on production host",
        "risk_level": "High"
    }
    entry = create_poam_entry(sample_eval)
    print("[✔] POA&M entry created:", json.dumps(entry, indent=2))
