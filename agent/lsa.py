# agent/lsa.py
# Local System Agent (LSA) for AutoNIST Core
# Collects basic host information and sends control evidence to the AutoNIST Core API.

import os
import json
import platform
import requests
from datetime import datetime
from hashlib import sha384

API_URL = os.getenv("AUTONIST_API_URL", "http://localhost:8080/evidence/ingest")

def collect_system_data():
    """
    Collects basic host data to serve as control evidence.
    Replace or extend these metrics for real production use.
    """
    data = {
        "control_id": "AC-2",
        "source": platform.node(),
        "value": {
            "user_count": get_user_count(),
            "baseline_match": True  # Example flag for CM-6 test
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    return data


def get_user_count():
    """Counts local user accounts (placeholder example)."""
    try:
        import pwd
        return len(pwd.getpwall())
    except Exception:
        # For non-Unix systems or sandboxed agents
        return 1


def compute_hash(payload):
    """Computes SHA-384 hash for data integrity."""
    return sha384(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def send_evidence(data):
    """
    Sends evidence to AutoNIST Core via POST request.
    Includes an integrity hash in the header.
    """
    evidence_hash = compute_hash(data)
    headers = {
        "Content-Type": "application/json",
        "X-Evidence-Hash": evidence_hash
    }
    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        print("[✔] Evidence successfully submitted:", response.json())
    except Exception as e:
        print("[✖] Submission failed:", str(e))


if __name__ == "__main__":
    evidence = collect_system_data()
    print("[*] Collected evidence:", json.dumps(evidence, indent=2))
    send_evidence(evidence)
