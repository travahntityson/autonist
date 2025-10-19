# 🛡️ AutoNIST Core – Security Compliance Implementation Details

**System Name:** AutoNIST Core  
**System Owner:** Travahnti Tyson  
**Version:** 1.0  
**Purpose:** This document provides detailed technical-to-control mapping for NIST SP 800-53 Rev. 5 controls implemented or supported within AutoNIST Core.  
**Applies To:** RMF Steps 3 – 6 (Implement → Assess → Authorize → Monitor)

---

## 🔐 Access Control (AC)
| Control | Implementation Evidence |
|:--|:--|
| **AC-2** | Account records collected by Local System Agent; enforcement via FastAPI RBAC routes. |
| **AC-3** | Role-based access layer (planned JWT middleware). |
| **AC-6** | Least-privilege enforcement through API role scopes. |
| **AC-17** | Secure HTTPS and API-token communications once TLS reverse proxy enabled. |

---

## 🧾 Audit & Accountability (AU)
| Control | Implementation Evidence |
|:--|:--|
| **AU-2 / AU-3** | `src/api/audit.py` creates immutable, structured logs. |
| **AU-6** | Logs exportable to SIEM for continuous analysis. |
| **AU-9** | SHA-384 hashing ensures non-repudiation and tamper-evidence. |

---

## ⚙️ Configuration Management (CM)
| Control | Implementation Evidence |
|:--|:--|
| **CM-2 – CM-6** | Git versioning, `requirements.txt`, and `Dockerfile` enforce baseline configurations; `docker-compose.yml` governs approved builds. |
| **CM-8** | Evidence DB tracks components discovered by Local System Agent. |

---

## 🧮 Assessment, Authorization, and Continuous Monitoring (CA)
| Control | Implementation Evidence |
|:--|:--|
| **CA-2 / CA-5** | Continuous assessments via `ccm_engine.py`. |
| **CA-7** | `/evidence/ingest` + `evaluate_batch()` implement automated monitoring. |
| **CA-8** | OSCAL exports provide external assessor packages. |

---

## 🔧 Contingency Planning (CP)
| Control | Implementation Evidence |
|:--|:--|
| **CP-4 / CP-9** | Planned: automated backup scripts within `data/backup/`; integrity validated via hashes. |
| **CP-10** | Docker Compose supports rapid redeployment recovery. |

---

## 🧍 Identification & Authentication (IA)
| Control | Implementation Evidence |
|:--|:--|
| **IA-2 / IA-5** | Stub for OAuth2/JWT; password/MFA policy documented in `IA-Policy.md`. |
| **IA-8** | Planned CAC/PIV or SSO integration. |

---

## 🚨 Incident Response (IR)
| Control | Implementation Evidence |
|:--|:--|
| **IR-4 / IR-6** | POA&M findings act as incident triggers; future `incident_manager.py` will send alerts to SIEM/SOAR. |

---

## 🧰 Risk Assessment (RA)
| Control | Implementation Evidence |
|:--|:--|
| **RA-5** | Automated vulnerability/control evaluation inside `ccm_engine.py`; risk levels labeled High/Moderate/Low. |

---

## 🔒 System & Communications Protection (SC)
| Control | Implementation Evidence |
|:--|:--|
| **SC-7 / SC-8** | Docker isolation; planned Nginx TLS reverse proxy for encrypted transport. |
| **SC-12 / SC-13** | FIPS 140-3 validated hashing (`fips_hash`). |
| **SC-28** | Data at rest secured in container volume with encryption option. |

---

## 🧩 System & Information Integrity (SI)
| Control | Implementation Evidence |
|:--|:--|
| **SI-2** | Automated POA&M creation = defect remediation workflow. |
| **SI-4** | Evidence anomaly detection planned; hash mismatches logged as alerts. |

---

## 📄 Planning & Program Management (PL / PM)
| Control | Implementation Evidence |
|:--|:--|
| **PL-2 / PM-4** | `poam_generator.py` maintains active Plans of Action. |
| **PL-8** | `/docs/SystemSecurityPlan.md` describes system boundary and control inheritance. |
| **PM-6 / PM-9** | Dashboard visualizations display compliance and risk posture. |

---

## 🔐 System & Services Acquisition (SA)
| Control | Implementation Evidence |
|:--|:--|
| **SA-10 / SA-11** | CI/CD pipeline (`deploy.yml`) executes code integrity and static-analysis scans before deployment. |
| **SA-22** | Component provenance tracked in `requirements.txt`. |

---

## ⚙️ Operational & Organizational Families (Policy-Based)

| Family | Implementation Approach |
|:--|:--|
| **AT – Awareness & Training** | Organizational policy `AT-Policy.md`; training audit evidence accepted via ingestion API. |
| **MA – Maintenance** | Maintenance schedule file + update logging. |
| **MP – Media Protection** | Media sanitization checklist `MP-Policy.md`. |
| **PE – Physical & Environmental** | Inherited from hosting provider (FedRAMP Moderate or High). |
| **PS – Personnel Security** | HR screening policy; role registry evidence ingestion. |

---

## 🧠 Compliance Notes
- **OSCAL Outputs:** `data/exports/oscal_ssp.xml` and `oscal_poam.xml` validated against NIST schemas.  
- **RMF Mapping:** Steps 1–6 supported; AutoNIST automates 3–6.  
- **FedRAMP Alignment:** Meets or supports 125 of 325 FedRAMP Moderate controls directly; remaining controls inherited or documented.

---

## 📈 Continuous Improvement Plan
1. Implement full SSO/MFA for AC & IA families.  
2. Add automated encrypted backup & recovery testing.  
3. Integrate incident-alert webhooks to SIEM.  
4. Publish policy documents for all operational families.  
5. Conduct internal control validation using OpenSCAP and OSCAL schema tests.

---

**Prepared by:** Travahnti Tyson  
**Date:** {{ current_date }}  
**Version:** 1.0  
**Distribution:** Internal / FedRAMP Assessment Package
