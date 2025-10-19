# src/main.py
# AutoNIST Core Backend
# This is the main entry point for the FastAPI service.

from fastapi import FastAPI
from datetime import datetime

# Initialize the FastAPI application
app = FastAPI(
    title="AutoNIST Core API",
    version="0.1.0",
    description="Baseline RMF automation backend for FedRAMP/NIST 800-171 compliance."
)

@app.get("/")
def read_root():
    """
    Basic health check endpoint.
    Returns current UTC time to confirm the API is active.
    """
    return {
        "status": "AutoNIST Core API running",
        "time": datetime.utcnow().isoformat() + "Z"
    }
1
