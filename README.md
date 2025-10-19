# 🛡️ AutoNIST Core Backend

**AutoNIST Core** is the backend service for a NIST 800-171 / 800-53 / FedRAMP High automation platform designed to streamline RMF documentation, control tracking, and evidence management for both government (air-gapped) and commercial deployments.

---

## 📘 Overview

AutoNIST Core automates compliance workflows by:

- Hosting and managing security control repositories in **OSCAL** format  
- Generating SSP, POA&M, and SAR documentation automatically  
- Providing an immutable audit log for accountability and non-repudiation  
- Enforcing RBAC aligned with **NIST AC-2, AC-3, IA-2**  
- Integrating with **FIPS 140-3 validated crypto modules**  
- Supporting both **air-gapped** and **cloud-native** architectures  

---

## 🧩 Project Structure

```
autonist-core/
├── src/
│   ├── main.py              # FastAPI entry point
│   ├── api/
│   │   └── audit.py         # Immutable audit logging API
│   ├── db/
│   │   └── models.py        # Database models for users, controls, logs
│   └── services/
│       └── crypto.py        # Cryptographic utilities (SHA-384 / FIPS-ready)
├── requirements.txt         # Python dependencies
├── Dockerfile               # Secure container build configuration
└── README.md                # Project documentation
```

---

## ⚙️ Running the Application (Development)

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 2️⃣ Run the API
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8080
```

Then open your browser to:
```
http://localhost:8080
```

You should see:
```json
{"status":"AutoNIST Core API running","time":"2025-10-19T00:00:00Z"}
```

---

## 🐳 Docker Deployment

Build the secure container:
```bash
docker build -t autonist-core .
```

Run the container:
```bash
docker run -d -p 8080:8080 autonist-core
```

---

## 🔒 Compliance Alignment

| NIST Control Family | AutoNIST Implementation |
|----------------------|--------------------------|
| **AC / IA** | RBAC structure and authentication enforcement |
| **AU** | Immutable WORM-style audit logs |
| **CM** | Version-controlled IaC & change tracking |
| **SC** | FIPS-validated crypto (SHA-384 baseline) |
| **SI** | Secure coding practices per SSDF (SP 800-218) |
| **RA / IR** | Hooks for risk and incident-response modules |

---

## 📄 Roadmap

**Phase I** – Core API, DB schema, and immutable audit logging ✅  
**Phase II** – Continuous Control Monitoring (CCM) engine  
**Phase III** – Self-hosted LLM for SSP/POA&M automation  
**Phase IV** – Air-gapped deployment + FedRAMP ATO prep  

---

## 👤 Maintainer

**Travahnti Tyson**  
Cybersecurity Engineer / RMF Automation Architect  
📧 ttyson@bradfordstarke.com]  
📜 Compliance focus: NIST 800-53 Rev.5, 800-171, 800-37, FedRAMP High

---

## ⚖️ License

Copyright © 2025 Travahnti Tyson  
Licensed under the **MIT License** (see LICENSE file for details).
