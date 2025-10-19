# 📘 AutoNIST Core – System Security Plan (SSP v1.0)

**System Name:** AutoNIST Core  
**System Type:** General Support System (GSS)  
**Owner:** Travahnti Tyson  
**Version:** 1.0  
**Date:** {{ current_date }}  
**Security Baseline:** NIST SP 800-53 Rev. 5 High | FedRAMP High | DoD IL5  
**Impact Level (FIPS 199):** High / High / High (C | I | A)

---

## 1  System Identification and Overview

| Field | Description |
| :-- | :-- |
| **System Name** | AutoNIST Core |
| **Acronym** | ANC |
| **System Categorization** | High / High / High (per FIPS 199 & SP 800-60) |
| **System Type** | General Support System (Compliance Automation Platform) |
| **Owner** | Travahnti Tyson – System Owner / Cybersecurity Engineer |
| **Authorizing Official** | TBD (Agency Sponsor) |
| **Information System Security Officer (ISSO)** | TBD |
| **Boundary Identifier** | AUTO-GRC-001 |
| **Primary Mission Function** | Automate RMF and NIST 800-171 compliance through evidence collection, control evaluation, POA&M generation, and OSCAL artifact export. |
| **System Status** | Operational – Phase IV (Production Deployment Readiness) |
| **Deployment Model** | Dual Architecture: Air-Gapped Enclave (On-Prem) and FedRAMP-Authorized Cloud (GovCloud or GCCH). |
| **Hosting Environment** | Customer-selected FedRAMP High PaaS/IaaS or DoD IL5 Data Center. Facility-level controls (PE family) are inherited from provider. |
| **Boundary Summary** | Application layer includes FastAPI service, Continuous Control Monitoring (CCM) engine, POA&M generator, dashboard renderer, and OSCAL exporter. Optional Local System Agent (LSA) extends boundary to endpoint collection nodes. |
| **Database Layer** | Platform-agnostic (plug-in interface supports PostgreSQL, MariaDB, MongoDB, and RESTful API data stores per customer choice). |
| **Interconnections** | HR systems (for role assignments), SIEM/SOC (for audit feeds), 3PAO assessment portal (for SSP/POA&M exchange). |
| **Data Types Processed** | Controlled Unclassified Information (CUI), audit logs, vulnerability data, policy artifacts, POA&M records. |
| **Information Sensitivity** | CUI / Internal Use / Non-Public. |
| **Criticality** | Mission-support system for security authorization and continuous monitoring activities. |
| **System Interconnection Approval Status** | Pending 3PAO review prior to ATO. |
| **Version Control and Baseline** | Managed via GitHub and Docker Compose – baseline frozen at commit `v1.0-PhaseIV`. |

### 1.1 Security Categorization Summary
- **Confidentiality:** High – System handles CUI and authorization data.  
- **Integrity:** High – Evidence tampering prevention via SHA-384 hash validation.  
- **Availability:** High – Redundant deployments and container replicas ensure service continuity.  
- **Overall Impact:** High  

### 1.2 Applicable Regulations and Frameworks
- FISMA (44 U.S.C. § 3541)  
- FedRAMP High Baseline  
- DoDI 8510.01 (RMF for DoD IT)  
- NIST SP 800-53 Rev. 5 / 53A / 37 / 171 / 137  
- FIPS 199 & 140-3  
- EO 14028 / OMB M-22-09  

---

## 2  Control Family – Access Control (AC)

### Family Summary
The Access Control family governs how users, processes, and devices are authorized to access AutoNIST Core resources. The platform provides role-based access control (RBAC) implemented within the FastAPI middleware, with optional integration to federated identity providers (Keycloak, Cognito, Azure AD, etc.). Additional controls are achieved through Docker network segmentation, TLS encryption, and container-level privilege restrictions.

---

### AC-1 – Access Control Policy and Procedures
- **Implementation:** Documented in `/docs/policies/AC-Policy.md`. Defines user access roles (Admin, Assessor, Read-Only), privilege escalation approval process, and audit requirements. Reviewed annually or upon major system change.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* policy document and *Interview* ISSO  
- **Evidence:** Policy file in repo commit `v1.0-PhaseIV`  

---

### AC-2 – Account Management (+ Enhancements 1, 3, 5, 7)
- **Implementation:** User and service accounts registered via `/src/api/audit.py` and tracked through Local System Agent feeds. Automated review runs weekly to detect inactive accounts (AC-2 (3)). Privileged account creation requires dual approval (AC-2 (1)). Shared accounts prohibited (AC-2 (5)). Account removal triggered automatically upon HR offboarding feed (AC-2 (7)).  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Test* API account provisioning; *Examine* audit logs  
- **Evidence:** Audit records (`/data/audit/`), HR integration logs  

---

### AC-3 – Access Enforcement
- **Implementation:** Access decisions enforced via RBAC middleware in `src/main.py`. Each endpoint decorated with role requirements. FastAPI dependency injection verifies token scope and session validity before processing.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* endpoint authorization; *Examine* code logic  
- **Evidence:** `src/main.py` – role dependencies (lines 45-120)  

---

### AC-4 – Information Flow Enforcement (+ Enhancements 1, 4)
- **Implementation:** Docker network policies restrict container traffic to explicit ports and subnets. In air-gapped mode, no external egress flows are permitted (AC-4 (1)). TLS and JWT token validation ensure labelled data is not cross-classified (AC-4 (4)).  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* network ACL rules; *Interview* admin  
- **Evidence:** `docker-compose.yml` network section; firewall rulebase  

---

### AC-5 – Separation of Duties
- **Implementation:** Distinct roles for developer, assessor, and operator. Production merge requires dual approval (GitHub branch protection).  
- **Responsible Role:** System Owner  
- **Assessment Method:** *Examine* repository protection rules  
- **Evidence:** `.github/branch_protection.json`  

---

### AC-6 – Least Privilege (+ Enhancement 1)
- **Implementation:** Privilege enforcement in RBAC; sudo rights restricted within containers. Administrative functions accessible only to “System Owner” role.  
- **Responsible Role:** System Administrator  
- **Assessment Method:** *Test* API permissions; *Examine* RBAC config  
- **Evidence:** RBAC policy JSON (`/config/rbac.json`)  

---

### AC-7 – Unsuccessful Login Attempts
- **Implementation:** FastAPI authentication middleware counts failed attempts; locks account after 5 failures for 15 minutes.  
- **Responsible Role:** DevSecOps  
- **Assessment Method:** *Test* auth lockout routine  
- **Evidence:** `auth_middleware.py` function `lock_account()`  

---

### AC-8 – System Use Notification
- **Implementation:** Login banner displayed before authentication, warning users of monitoring and consent requirements.  
- **Responsible Role:** ISSO  
- **Assessment Method:** *Examine* banner text; *Test* login flow  
- **Evidence:** `templates/login_banner.html`  

---

### AC-17 – Remote Access (+ Enhancements 1, 2)
- **Implementation:** Remote admin sessions permitted only over TLS 1.3 VPN tunnels with MFA (AC-17 (2)). Split-tunneling disabled. In air-gapped mode, remote access is disabled entirely.  
- **Responsible Role:** Network Engineer  
- **Assessment Method:** *Interview* admin; *Test* VPN configuration  
- **Evidence:** VPN config (`/config/vpn.conf`)  

---

### AC-18 – Wireless Access
- **Implementation:** Wireless access disabled by default in air-gapped mode. When enabled in cloud deployments, FedRAMP provider enforces WPA3 Enterprise and MAC filtering.  
- **Responsible Role:** Network Engineer  
- **Assessment Method:** *Examine* provider FedRAMP package (PE/SC inheritance)  
- **Evidence:** FedRAMP SSP – AWS GovCloud PE Controls  

---

### AC-19 – Access Control for Mobile Devices
- **Implementation:** Mobile access restricted to read-only dashboard view; MFA required. Device compliance checked through MDM policy.  
- **Responsible Role:** ISSO / IT Security  
- **Assessment Method:** *Test* mobile access; *Interview* ISSO  
- **Evidence:** `/docs/policies/Mobile-Policy.md`  

---

### AC-20 – Use of External Information Systems
- **Implementation:** External systems may connect only through API gateway with signed MoA/MoU. Data exchanges encrypted and logged.  
- **Responsible Role:** Authorizing Official  
- **Assessment Method:** *Examine* interconnection agreements  
- **Evidence:** `/docs/interconnections/MoA-Template.md`  

---

### AC-22 – Publicly Accessible Content
- **Implementation:** Public dashboard mode redacts CUI and metadata. Output sanitized before external publishing.  
- **Responsible Role:** System Owner  
- **Assessment Method:** *Test* export function; *Examine* content filters  
- **Evidence:** `src/services/oscal_exporter.py`  

---

### Access Control Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 20 | 15 | 3 | 1 | 1 |

**Residual Risk:** Low – MFA integration and automated offboarding under development.  
**Next Milestones:** Deploy federated SSO integration; complete AC-4 policy test automation.

---
## 3  Control Family – Awareness and Training (AT)

### Family Summary
The Awareness and Training (AT) family ensures all personnel associated with AutoNIST Core understand their security responsibilities and receive regular instruction commensurate with system risk and data sensitivity.  
AutoNIST Core supports organizational training tracking through evidence ingestion APIs and integrates policy awareness within login workflows.

---

### AT-1 – Security Awareness and Training Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/AT-Policy.md`. The policy establishes requirements for initial, annual, and role-specific cybersecurity training. It specifies roles responsible for implementation (HR, ISO, ISSO) and mandates training completion prior to system access.  
- **Responsible Role:** Information System Security Officer (ISSO) / Human Resources  
- **Assessment Method:** *Examine* AT-Policy; *Interview* HR and ISSO  
- **Evidence:** `AT-Policy.md` file; HR training records  

---

### AT-2 – Literacy, Awareness, and Role-Based Training (+ Enhancements 1, 2)
- **Implementation:**  
  Users must complete basic security awareness modules before receiving credentials (AT-2).  
  Administrators, developers, and assessors receive role-based instruction on RMF processes, handling of CUI, and secure coding practices (AT-2 (1)).  
  AutoNIST Core records evidence of completion through `/src/api/evidence.py`, allowing ingestion of CSV or API feeds from a Learning Management System (AT-2 (2)).  
- **Responsible Role:** HR / System Owner  
- **Assessment Method:** *Examine* LMS export; *Test* evidence ingestion; *Interview* selected users  
- **Evidence:** `evidence/training_records.json`; LMS completion certificates  

---

### AT-3 – Role-Based Security Training
- **Implementation:**  
  Specialized training provided for:  
  - **Developers:** secure coding and container hardening (SA-11, SI-2 linkage)  
  - **Assessors:** RMF assessment procedures and OSCAL data handling  
  - **Administrators:** incident handling, audit log review, and privilege management  
  AutoNIST Core verifies training completion through evidence ingestion and correlates user IDs with RBAC roles.  
- **Responsible Role:** DevSecOps Lead / HR  
- **Assessment Method:** *Interview* role participants; *Examine* role mapping  
- **Evidence:** `training_matrix.csv`; RBAC mapping file `/config/rbac.json`  

---

### AT-4 – Security Training Records
- **Implementation:**  
  All training completion data maintained within the Evidence Database.  
  `src/services/ccm_engine.py` periodically checks training compliance status (AT-4).  
  Non-compliant personnel generate automatic POA&M entries for corrective action.  
- **Responsible Role:** ISSO / HR  
- **Assessment Method:** *Test* evidence query; *Examine* POA&M records  
- **Evidence:** Evidence ingestion logs; `poam_generator.py` output  

---

### AT-5 – Practical Exercises (Organizational Enhancement)
- **Implementation:**  
  The organization conducts simulated phishing and incident-response tabletop exercises annually.  
  Results are documented and imported into AutoNIST Core for tracking (AT-5).  
- **Responsible Role:** ISSO / Training Coordinator  
- **Assessment Method:** *Interview* participants; *Examine* exercise reports  
- **Evidence:** `evidence/tabletop_exercise_YYYY.json`; Training After-Action Report  

---

### Awareness and Training Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 5 | 3 | 2 | 0 | 0 |

**Residual Risk:** Low – LMS integration automation in progress.  
**Next Milestones:** Deploy API-based LMS connector; link non-completion alerts to POA&M workflow.
## 4  Control Family – Audit and Accountability (AU)

### Family Summary
The Audit and Accountability (AU) family ensures AutoNIST Core records, protects, and reviews all actions that could impact confidentiality, integrity, and availability.  
AutoNIST Core employs immutable, cryptographically hashed audit logs, automated retention management, and evidence ingestion for audit events across its distributed components.

---

### AU-1 – Audit and Accountability Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/AU-Policy.md`. The policy mandates event auditing for all administrative, configuration, and security-relevant actions. Procedures describe log review frequency, responsible personnel, and data protection mechanisms.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* AU-Policy; *Interview* ISSO  
- **Evidence:** `AU-Policy.md` in `/docs/policies/`  

---

### AU-2 – Event Logging (+ Enhancements 1, 3)
- **Implementation:**  
  Audit logs generated by each API endpoint using `src/api/audit.py`. Events include authentication, privilege use, evidence upload, configuration changes, and control assessment results.  
  Audit records are cryptographically hashed with SHA-384 (AU-2 (3)) to ensure immutability.  
  Logging is enforced application-wide; unauthorized logging suppression attempts are blocked by middleware.  
- **Responsible Role:** DevSecOps Engineer / ISSO  
- **Assessment Method:** *Test* logging function; *Examine* audit events  
- **Evidence:** `src/api/audit.py`; `data/audit/records_YYYY.json`  

---

### AU-3 – Content of Audit Records (+ Enhancements 1, 2)
- **Implementation:**  
  Each log entry includes timestamp, user ID, source IP, action type, affected object, and system response.  
  Enhancement (AU-3 (1)) extends to session identifiers and outcome codes for traceability.  
  Enhancement (AU-3 (2)) applies digital signatures for tamper detection.  
- **Responsible Role:** System Developer / ISSO  
- **Assessment Method:** *Examine* sample audit record structure  
- **Evidence:** JSON schema: `/schemas/audit_record_schema.json`  

---

### AU-4 – Audit Storage Capacity
- **Implementation:**  
  The system monitors audit database size using automated scripts.  
  When threshold >80% is reached, alerts are generated and archived logs compressed.  
  Implemented through `ccm_engine.py` scheduled tasks.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* threshold alert; *Examine* cron configuration  
- **Evidence:** `/src/services/ccm_engine.py`; system logs  

---

### AU-5 – Response to Audit Processing Failures
- **Implementation:**  
  If audit processing fails (e.g., database outage), events are queued locally and retried.  
  Failures beyond threshold trigger an incident alert (IR-4 linkage).  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Test* simulated outage recovery; *Interview* admin  
- **Evidence:** `src/api/audit.py` error-handling routines  

---

### AU-6 – Audit Review, Analysis, and Reporting (+ Enhancements 1, 3)
- **Implementation:**  
  Audit logs reviewed weekly by ISSO for anomalies and unauthorized access attempts.  
  Automated analytics engine flags deviations from normal baselines (AU-6 (1)).  
  Reports are exported as CSV/JSON and uploaded to ConMon dashboard (AU-6 (3)).  
- **Responsible Role:** ISSO / Security Analyst  
- **Assessment Method:** *Examine* reports; *Interview* ISSO  
- **Evidence:** `/reports/audit_summary_YYYY.csv`; `ccm_engine.log`  

---

### AU-7 – Audit Reduction and Report Generation (+ Enhancements 1)
- **Implementation:**  
  CCM Engine performs log normalization and aggregation. Filters by user, date, and event type.  
  Enhancement (AU-7 (1)) enables correlation with POA&M entries.  
- **Responsible Role:** Security Analyst  
- **Assessment Method:** *Test* report generation; *Examine* reduction queries  
- **Evidence:** `src/services/ccm_engine.py` function `generate_audit_report()`  

---

### AU-8 – Time Stamps (+ Enhancements 1)
- **Implementation:**  
  All systems synchronize to NTP with ±2 second tolerance (AU-8).  
  UTC format used for all timestamps; drift alarms configured for >3 seconds (AU-8 (1)).  
- **Responsible Role:** System Administrator  
- **Assessment Method:** *Test* NTP sync; *Examine* system time configuration  
- **Evidence:** `/config/ntp.conf`  

---

### AU-9 – Protection of Audit Information (+ Enhancements 1, 2)
- **Implementation:**  
  Audit files are write-only for application accounts.  
  Admins cannot modify or delete records once committed.  
  Encrypted storage enforced via AES-256 with key rotation every 90 days (AU-9 (1)).  
  In air-gapped mode, backups stored offline on encrypted drives (AU-9 (2)).  
- **Responsible Role:** ISSO / Storage Admin  
- **Assessment Method:** *Test* file permissions; *Examine* encryption logs  
- **Evidence:** File ACLs; `encryption_rotation.log`  

---

### AU-10 – Non-Repudiation
- **Implementation:**  
  Digital signature verification and immutable event hashes guarantee origin authenticity.  
  User actions cryptographically bound to tokens validated via RBAC.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Test* signature validation; *Examine* event hashes  
- **Evidence:** `src/services/crypto.py`; signed audit entries  

---

### AU-11 – Audit Record Retention
- **Implementation:**  
  Audit logs retained for 18 months minimum or per customer-defined retention period.  
  Retention policy configurable via `/config/log_retention.json`.  
- **Responsible Role:** ISSO / Compliance Officer  
- **Assessment Method:** *Examine* retention policy; *Test* retention enforcement  
- **Evidence:** Retention configuration file; archived log folder structure  

---

### AU-12 – Audit Generation
- **Implementation:**  
  All system components generate standardized JSON-format audit events through a shared library.  
  The logging interface ensures schema consistency across distributed modules.  
- **Responsible Role:** System Developer  
- **Assessment Method:** *Test* audit library output; *Examine* code base  
- **Evidence:** `/src/services/logging_handler.py`  

---

### Audit and Accountability Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 12 | 10 | 1 | 1 | 0 |

**Residual Risk:** Low – additional analytic dashboards under enhancement.  
**Next Milestones:** Deploy SIEM integration via secure API; finalize centralized alert correlation.
## 5  Control Family – Security Assessment and Authorization (CA)

### Family Summary
The Security Assessment and Authorization (CA) family ensures AutoNIST Core undergoes continuous and independent evaluation to verify implemented security controls remain effective, properly documented, and authorized before operation.  
AutoNIST Core automates major portions of the RMF process—control evidence collection, assessment, and POA&M generation—allowing assessors to validate compliance at scale.

---

### CA-1 – Security Assessment and Authorization Policies and Procedures
- **Implementation:**  
  Documented in `/docs/policies/CA-Policy.md`. Defines assessment frequency, testing methodology, roles, and required artifacts (SSP, SAP, SAR, POA&M). Procedures require assessments prior to ATO and after major system changes.  
- **Responsible Role:** Authorizing Official (AO) / ISSO  
- **Assessment Method:** *Examine* CA-Policy; *Interview* AO  
- **Evidence:** `CA-Policy.md`; FedRAMP High Policy Cross-Reference  

---

### CA-2 – Control Assessments (+ Enhancements 1, 2)
- **Implementation:**  
  AutoNIST Core’s CCM Engine continuously tests control evidence for compliance scoring (CA-2).  
  Enhancement (CA-2 (1)): 3PAO or independent assessor validates CCM results quarterly.  
  Enhancement (CA-2 (2)): Automated POA&M entries generated for non-compliant controls.  
- **Responsible Role:** Independent Assessor / ISSO  
- **Assessment Method:** *Test* CCM output; *Examine* POA&M mapping  
- **Evidence:** `src/services/ccm_engine.py`; `reports/control_status.json`  

---

### CA-3 – System Interconnections (+ Enhancements 1, 2)
- **Implementation:**  
  All external connections are documented in the Interconnection Control Agreement (ICA).  
  Enhancement (CA-3 (1)): Each interconnection undergoes annual review and re-approval.  
  Enhancement (CA-3 (2)): Encrypted APIs enforce mutual TLS authentication and token-based authorization.  
- **Responsible Role:** AO / ISSO / Network Engineer  
- **Assessment Method:** *Examine* ICA; *Test* TLS enforcement  
- **Evidence:** `/docs/interconnections/ICA_Template.md`; API Gateway configuration  

---

### CA-5 – Plan of Action and Milestones (POA&M)
- **Implementation:**  
  AutoNIST Core automatically generates and maintains POA&Ms for each finding (CA-5).  
  Each POA&M entry includes responsible party, remediation steps, risk level, and due date.  
  The POA&M module integrates directly with the CCM Engine and Evidence Store.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* POA&M records; *Test* automated generation  
- **Evidence:** `/src/services/poam_generator.py`; `poam_records.json`  

---

### CA-6 – Authorization
- **Implementation:**  
  The Authorizing Official reviews the SSP, SAR, and POA&M to issue an Authorization to Operate (ATO).  
  Digital approval stored and cryptographically signed for authenticity.  
  The system supports tracking of multiple authorizations (e.g., enclave vs. SaaS).  
- **Responsible Role:** Authorizing Official (AO)  
- **Assessment Method:** *Examine* ATO package; *Interview* AO  
- **Evidence:** `/docs/authorization/ATO_Record.md`  

---

### CA-7 – Continuous Monitoring (+ Enhancements 1, 2)
- **Implementation:**  
  Implements NIST SP 800-137 continuous monitoring model.  
  Enhancement (CA-7 (1)): Metrics tracked via dashboard showing control compliance trends.  
  Enhancement (CA-7 (2)): Automated monthly summary delivered to AO and ISSO.  
  CCM Engine pulls system metrics from audit logs and evidence database.  
- **Responsible Role:** ISSO / System Owner / Security Analyst  
- **Assessment Method:** *Test* monitoring workflow; *Examine* metrics reports  
- **Evidence:** `/src/services/ccm_engine.py`; `ConMon_dashboard.json`  

---

### CA-8 – Penetration Testing
- **Implementation:**  
  Annual penetration test conducted by an independent assessor.  
  AutoNIST Core stores findings, associated risk levels, and remediation tasks.  
  Test scope includes API endpoints, data validation routines, and encryption modules.  
- **Responsible Role:** Independent Assessor / ISSO  
- **Assessment Method:** *Examine* pen-test report; *Interview* assessor  
- **Evidence:** `/reports/penetration_test_YYYY.pdf`; POA&M linkage entries  

---

### CA-9 – Internal System Connections
- **Implementation:**  
  All internal microservices (API, CCM Engine, Evidence Store) communicate over isolated Docker networks secured by TLS.  
  Service-to-service tokens enforce mutual authentication.  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* internal connection enforcement; *Examine* container configs  
- **Evidence:** `docker-compose.yml`; `service_auth_tokens.json`  

---

### Security Assessment and Authorization Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 9 | 8 | 1 | 0 | 0 |

**Residual Risk:** Low – minor enhancement testing pending.  
**Next Milestones:** Automate 3PAO evidence export; finalize continuous monitoring dashboard reporting schedule.
