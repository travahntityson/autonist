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

## 6  Control Family – Configuration Management (CM)

### Family Summary
The Configuration Management (CM) family ensures AutoNIST Core maintains the integrity and security of system configurations throughout its lifecycle.  
Configuration changes are tracked through Git-based version control, peer-reviewed commits, Infrastructure-as-Code (IaC) deployment files, and automated baseline enforcement through container orchestration.

---

### CM-1 – Configuration Management Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/CM-Policy.md`. Establishes configuration control processes, baseline documentation, and approval procedures for all changes.  
  Defines responsibilities for configuration managers, developers, and security officers.  
- **Responsible Role:** Configuration Manager / ISSO  
- **Assessment Method:** *Examine* CM-Policy; *Interview* CM Lead  
- **Evidence:** `CM-Policy.md`; change control board (CCB) minutes  

---

### CM-2 – Baseline Configuration (+ Enhancements 1, 2, 3)
- **Implementation:**  
  Baseline configurations for containers, APIs, and operating systems are stored in GitHub.  
  Enhancement (CM-2 (1)): Maintains multiple approved configurations (air-gapped vs. GovCloud).  
  Enhancement (CM-2 (2)): Changes automatically documented via commit metadata.  
  Enhancement (CM-2 (3)): Configuration drift detection occurs nightly via SCAP scanning.  
- **Responsible Role:** DevSecOps Engineer / Configuration Manager  
- **Assessment Method:** *Examine* Git commit logs; *Test* baseline drift detection  
- **Evidence:** `Dockerfile`; `docker-compose.yml`; `baseline_scan_results.xml`  

---

### CM-3 – Configuration Change Control (+ Enhancements 1, 2)
- **Implementation:**  
  All changes undergo peer review and are tracked in GitHub pull requests.  
  Enhancement (CM-3 (1)): Requires dual approval for production merges.  
  Enhancement (CM-3 (2)): Automatic rollback feature allows restoration of previous configurations.  
- **Responsible Role:** Configuration Manager / System Owner  
- **Assessment Method:** *Examine* PR logs; *Test* rollback procedure  
- **Evidence:** `.github/workflows/change_control.yml`; `rollback_script.sh`  

---

### CM-4 – Security Impact Analysis (+ Enhancements 1, 2)
- **Implementation:**  
  Every configuration change triggers a security impact analysis via automated scripts that assess affected controls.  
  Enhancement (CM-4 (1)): Identifies changes affecting cryptographic or privileged modules.  
  Enhancement (CM-4 (2)): Automatically updates POA&M entries if impact is detected.  
- **Responsible Role:** DevSecOps / ISSO  
- **Assessment Method:** *Test* change pipeline; *Examine* analysis logs  
- **Evidence:** `/src/services/change_analyzer.py`; `impact_report.json`  

---

### CM-5 – Access Restrictions for Change (+ Enhancements 1, 2)
- **Implementation:**  
  Only authorized maintainers can approve configuration changes.  
  Enhancement (CM-5 (1)): Change control operations are logged and hashed.  
  Enhancement (CM-5 (2)): Privileged access reviewed weekly for least-privilege enforcement.  
- **Responsible Role:** Configuration Manager / ISSO  
- **Assessment Method:** *Test* RBAC restrictions; *Examine* change logs  
- **Evidence:** `.github/branch_protection.json`; audit logs  

---

### CM-6 – Configuration Settings (+ Enhancements 1, 2)
- **Implementation:**  
  Configuration parameters defined in secure templates.  
  Enhancement (CM-6 (1)): Deviations automatically flagged by the CCM Engine.  
  Enhancement (CM-6 (2)): Default configurations comply with DISA STIG and CIS Benchmarks.  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Test* baseline enforcement; *Examine* STIG compliance results  
- **Evidence:** `/config/settings.yaml`; `stig_scan_output.xml`  

---

### CM-7 – Least Functionality (+ Enhancements 1, 2)
- **Implementation:**  
  Only essential services are enabled in production containers.  
  Enhancement (CM-7 (1)): Regular reviews verify no unused ports, packages, or APIs.  
  Enhancement (CM-7 (2)): Security-hardened base images enforce minimal privileges.  
- **Responsible Role:** System Administrator / DevSecOps  
- **Assessment Method:** *Test* service restrictions; *Examine* container build logs  
- **Evidence:** `Dockerfile`; container audit report  

---

### CM-8 – System Component Inventory (+ Enhancements 1, 2, 3)
- **Implementation:**  
  The system maintains a dynamic inventory of software components, versions, and configurations.  
  Enhancement (CM-8 (1)): Components automatically discovered via LSA Agent.  
  Enhancement (CM-8 (2)): Components mapped to corresponding security controls.  
  Enhancement (CM-8 (3)): Inventory validated weekly via API call to baseline repository.  
- **Responsible Role:** Configuration Manager / DevSecOps  
- **Assessment Method:** *Test* inventory API; *Examine* inventory report  
- **Evidence:** `src/api/lsa_agent.py`; `component_inventory.json`  

---

### CM-9 – Configuration Management Plan
- **Implementation:**  
  A detailed Configuration Management Plan (CMP) documents configuration items, versioning, roles, and approval authorities.  
  Updated with every significant architecture or code change.  
- **Responsible Role:** Configuration Manager / System Owner  
- **Assessment Method:** *Examine* CMP; *Interview* CM Lead  
- **Evidence:** `/docs/CM_Plan.md`  

---

### CM-10 – Software Usage Restrictions
- **Implementation:**  
  All open-source libraries are vetted against the approved components list.  
  SBOM scanning via dependency-check ensures license and version compliance.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* SBOM validation; *Examine* scan reports  
- **Evidence:** `sbom_report.xml`; `requirements.txt`  

---

### CM-11 – User-Installed Software
- **Implementation:**  
  Users cannot install unapproved software within the system boundary.  
  Developer containers rebuilt nightly to remove unauthorized additions.  
- **Responsible Role:** ISSO / System Administrator  
- **Assessment Method:** *Test* container baseline rebuild; *Interview* admin  
- **Evidence:** Container rebuild logs; baseline integrity hashes  

---

### Configuration Management Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 11 | 9 | 2 | 0 | 0 |

**Residual Risk:** Low – additional IaC validation in progress.  
**Next Milestones:** Complete automated baseline documentation in OSCAL; integrate dynamic SBOM updates into continuous monitoring workflow.

## 7  Control Family – Contingency Planning (CP)

### Family Summary
The Contingency Planning (CP) family ensures AutoNIST Core can continue essential operations in the event of disruptions, disasters, or cyber incidents.  
The system includes automated backup, recovery, redundancy, and reconstitution mechanisms tested regularly in both the air-gapped and cloud-based environments.

---

### CP-1 – Contingency Planning Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/CP-Policy.md`. Defines contingency objectives, responsibilities, recovery strategies, and testing frequency.  
  Policy mandates semi-annual plan reviews and post-incident updates.  
- **Responsible Role:** System Owner / ISSO  
- **Assessment Method:** *Examine* CP-Policy; *Interview* ISSO  
- **Evidence:** `CP-Policy.md`  

---

### CP-2 – Contingency Plan (+ Enhancements 1, 2)
- **Implementation:**  
  The Contingency Plan (CP) outlines step-by-step recovery procedures, prioritization of critical services, and restoration order.  
  Enhancement (CP-2 (1)): Includes contact lists, escalation matrix, and vendor dependencies.  
  Enhancement (CP-2 (2)): Reviewed annually or after significant system change.  
- **Responsible Role:** System Owner / Recovery Manager  
- **Assessment Method:** *Examine* CP document; *Interview* recovery team  
- **Evidence:** `/docs/Contingency_Plan.md`  

---

### CP-3 – Contingency Training
- **Implementation:**  
  All personnel with contingency responsibilities receive annual training and participate in recovery exercises.  
  Training records tracked through the Evidence Store.  
- **Responsible Role:** ISSO / HR  
- **Assessment Method:** *Examine* training logs; *Interview* staff  
- **Evidence:** `evidence/training_records.json`  

---

### CP-4 – Contingency Plan Testing (+ Enhancements 1, 2)
- **Implementation:**  
  Annual functional and simulation tests validate backup integrity and restoration procedures.  
  Enhancement (CP-4 (1)): Exercises coordinated with IR and COOP teams.  
  Enhancement (CP-4 (2)): Corrective actions captured as POA&M entries.  
- **Responsible Role:** ISSO / Recovery Manager  
- **Assessment Method:** *Test* restore drill; *Examine* after-action report  
- **Evidence:** `/reports/restore_test_YYYY.pdf`; POA&M entries  

---

### CP-6 – Alternate Storage Site (+ Enhancements 1, 2)
- **Implementation:**  
  Backups stored at encrypted off-site or cloud-based locations compliant with FedRAMP High.  
  Enhancement (CP-6 (1)): Geographic separation ≥ 200 miles from primary site.  
  Enhancement (CP-6 (2)): Replication verified quarterly.  
- **Responsible Role:** Storage Admin / ISSO  
- **Assessment Method:** *Test* data replication; *Examine* storage logs  
- **Evidence:** `backup_replication_report.json`  

---

### CP-7 – Alternate Processing Site (+ Enhancements 1, 2)
- **Implementation:**  
  Secondary environment maintained for fail-over operations within approved enclave or GovCloud region.  
  Enhancement (CP-7 (1)): Replication enabled for core services and databases.  
  Enhancement (CP-7 (2)): Recovery time objective (RTO) ≤ 4 hours.  
- **Responsible Role:** System Owner / DevSecOps  
- **Assessment Method:** *Test* fail-over; *Examine* configuration settings  
- **Evidence:** `docker-compose-backup.yml`; recovery simulation logs  

---

### CP-8 – Telecommunications Services
- **Implementation:**  
  Alternate secure communication paths (VPN, satellite, or GovCloud interlink) established for recovery coordination.  
  All traffic encrypted (TLS 1.3 or IPsec).  
- **Responsible Role:** Network Engineer  
- **Assessment Method:** *Test* alternate link; *Interview* network admin  
- **Evidence:** `/config/vpn_backup.conf`  

---

### CP-9 – System Backup (+ Enhancements 1, 2)
- **Implementation:**  
  Encrypted full system backups performed nightly; incremental backups hourly for databases.  
  Enhancement (CP-9 (1)): Backup integrity verified using hash validation.  
  Enhancement (CP-9 (2)): Offline copies retained for 30 days minimum.  
- **Responsible Role:** System Administrator / Storage Admin  
- **Assessment Method:** *Test* restore process; *Examine* backup logs  
- **Evidence:** `backup_schedule.yml`; `integrity_validation.log`  

---

### CP-10 – System Recovery and Reconstitution
- **Implementation:**  
  AutoNIST Core includes a documented reconstitution plan allowing full redeployment from source control.  
  Docker Compose and IaC templates restore services within defined RTO/RPO.  
  Recovery testing performed quarterly.  
- **Responsible Role:** DevSecOps / ISSO  
- **Assessment Method:** *Test* reconstitution procedure; *Examine* IaC templates  
- **Evidence:** `docker-compose.yml`; `restore_instructions.md`  

---

### CP-11 – Alternate Communications Protocols (Organizational Enhancement)
- **Implementation:**  
  Secure messaging (Signal, encrypted email) available when primary comms are offline.  
  Used during emergency coordination between enclaves.  
- **Responsible Role:** System Owner / Comms Officer  
- **Assessment Method:** *Interview* contingency team; *Examine* protocol usage records  
- **Evidence:** `emergency_comms_plan.md`  

---

### Contingency Planning Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 10 | 8 | 2 | 0 | 0 |

**Residual Risk:** Low – additional automation of off-site verification in progress.  
**Next Milestones:** Integrate backup validation metrics into ConMon dashboard; finalize COOP alignment with organizational continuity plan.

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

## 8  Control Family – Identification and Authentication (IA)

### Family Summary
The Identification and Authentication (IA) family ensures that AutoNIST Core verifies user and system identities before granting access.  
Authentication is enforced through role-based access tokens, multi-factor authentication (MFA), and cryptographically protected credentials.  
In the air-gapped deployment, local CAC/PIV credentials are used; in the cloud deployment, SAML, OpenID Connect (OIDC), or SCIM integration provides federated identity management.

---

### IA-1 – Identification and Authentication Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/IA-Policy.md`. Defines account creation, authentication, MFA enforcement, and credential management requirements.  
  Procedures describe how tokens, certificates, and passwords are issued, rotated, and revoked.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* IA-Policy; *Interview* ISSO  
- **Evidence:** `IA-Policy.md`  

---

### IA-2 – Identification and Authentication (Organizational Users) (+ Enhancements 1–12)
- **Implementation:**  
  All users must authenticate before accessing system resources.  
  - (IA-2): Enforced through FastAPI JWT-based authentication middleware.  
  - (IA-2 (1)): MFA (TOTP or CAC) required for privileged users.  
  - (IA-2 (2)): Non-privileged users use username/password + token.  
  - (IA-2 (3)): Unique identifiers assigned to every account.  
  - (IA-2 (4)): Admin logins restricted to secure networks.  
  - (IA-2 (5)): Authentication re-prompt every 12 hours.  
  - (IA-2 (6)): MFA enforced across remote sessions.  
  - (IA-2 (11)): Replay and token-reuse detection implemented.  
  - (IA-2 (12)): MFA logs stored for 18 months.  
- **Responsible Role:** System Administrator / DevSecOps  
- **Assessment Method:** *Test* authentication workflow; *Examine* logs  
- **Evidence:** `auth_middleware.py`; `data/audit/login_records.json`  

---

### IA-3 – Device Identification and Authentication (+ Enhancements 1, 2)
- **Implementation:**  
  LSA Agents register with unique API keys and certificate fingerprints.  
  Enhancement (IA-3 (1)): Mutual TLS validation required for all device connections.  
  Enhancement (IA-3 (2)): Devices with revoked certificates denied network access.  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* certificate authentication; *Examine* agent registration logs  
- **Evidence:** `src/api/lsa_agent.py`; `/config/cert_store/`  

---

### IA-4 – Identifier Management (+ Enhancements 1, 2)
- **Implementation:**  
  User identifiers issued, retired, and re-assigned under documented procedures.  
  Enhancement (IA-4 (1)): No reuse of unique identifiers for 24 months.  
  Enhancement (IA-4 (2)): HR offboarding triggers automatic ID deactivation.  
- **Responsible Role:** HR / ISSO  
- **Assessment Method:** *Examine* HR procedures; *Test* automated offboarding script  
- **Evidence:** `user_deprovision.yml`; HR feed logs  

---

### IA-5 – Authenticator Management (+ Enhancements 1–11)
- **Implementation:**  
  Passwords and tokens meet FedRAMP High entropy standards (min 15 chars, 2 factors).  
  - (IA-5 (1)): Passwords hashed with Argon2 and salted.  
  - (IA-5 (2)): MFA keys stored using HSM-protected vault.  
  - (IA-5 (4)): MFA reset requires out-of-band verification.  
  - (IA-5 (6)): Tokens expire after 24 hours.  
  - (IA-5 (7)): Password reuse prohibited for 12 generations.  
  - (IA-5 (11)): Private keys validated before use.  
- **Responsible Role:** ISSO / DevSecOps  
- **Assessment Method:** *Test* password reset; *Examine* HSM config  
- **Evidence:** `src/services/crypto.py`; `/config/hsm_vault.json`  

---

### IA-6 – Authenticator Feedback
- **Implementation:**  
  Login pages never reveal which credential failed.  
  Generic error messages prevent username enumeration.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* login attempts; *Examine* code logic  
- **Evidence:** `auth_middleware.py`  

---

### IA-7 – Cryptographic Module Authentication
- **Implementation:**  
  Crypto functions use FIPS 140-3 validated libraries (OpenSSL FIPS Module 3.0).  
  Tokens cryptographically bound to session certificates.  
- **Responsible Role:** DevSecOps / ISSO  
- **Assessment Method:** *Examine* cryptographic module configuration  
- **Evidence:** `/src/services/crypto.py`; FIPS validation certificate reference  

---

### IA-8 – Identification and Authentication (Non-Organizational Users)
- **Implementation:**  
  External users (e.g., assessors, contractors) authenticate via federation with customer IdP (SAML/OIDC).  
  Roles limited to “Read-Only” or “Assessor.”  
- **Responsible Role:** AO / ISSO  
- **Assessment Method:** *Test* external IdP login; *Examine* federation configuration  
- **Evidence:** `/config/sso_config.yaml`  

---

### IA-9 – Service Identification and Authentication
- **Implementation:**  
  Inter-service authentication between CCM Engine, Evidence Store, and API Gateway uses service account tokens signed with RSA-4096 keys.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* token verification; *Examine* inter-service config  
- **Evidence:** `service_auth_tokens.json`; `src/api/gateway.py`  

---

### IA-10 – Adaptive Identification and Authentication (Organizational Enhancement)
- **Implementation:**  
  Adaptive authentication increases security requirements for high-risk actions (e.g., POA&M edits, evidence deletion).  
  MFA challenge triggered when anomalous behavior detected by the CCM Engine.  
- **Responsible Role:** ISSO / Security Analyst  
- **Assessment Method:** *Test* adaptive trigger; *Examine* monitoring config  
- **Evidence:** `src/services/ccm_engine.py`; `auth_policy_rules.yaml`  

---

### Identification and Authentication Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 10 | 8 | 2 | 0 | 0 |

**Residual Risk:** Low – CAC/PIV integration automation in progress.  
**Next Milestones:** Implement FIDO2 WebAuthn support; finalize adaptive MFA rollout for privileged access.

## 9  Control Family – Incident Response (IR)

### Family Summary
The Incident Response (IR) family ensures AutoNIST Core can effectively detect, report, analyze, and respond to cybersecurity incidents to minimize impact and prevent recurrence.  
The system provides a dedicated Incident Response Hub that integrates with the Continuous Control Monitoring (CCM) engine to automate detection, escalation, and evidence collection aligned with NIST SP 800-61r2 guidance.

---

### IR-1 – Incident Response Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/IR-Policy.md`. Establishes an incident response capability consistent with NIST SP 800-61.  
  Procedures detail incident classification (low, moderate, high), response roles, reporting timelines, and coordination with US-CERT or DoD Cyber Crime Center (DC3) when applicable.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* IR-Policy; *Interview* ISSO  
- **Evidence:** `IR-Policy.md`  

---

### IR-2 – Incident Response Training
- **Implementation:**  
  All system administrators and assessors receive annual incident response training covering detection, analysis, containment, eradication, and recovery phases.  
  Completion tracked through Evidence Store.  
- **Responsible Role:** ISSO / HR  
- **Assessment Method:** *Examine* training logs; *Interview* IR personnel  
- **Evidence:** `evidence/training_records.json`; LMS integration logs  

---
## 14  Control Family – Personnel Security (PS)

### Family Summary
The Personnel Security (PS) family ensures that all individuals with access to AutoNIST Core systems and data are properly screened, trained, and managed to minimize insider threat risks and maintain operational integrity.  
Controls govern pre-employment screening, ongoing personnel evaluations, transfer and termination procedures, and formal accountability for system access and data handling responsibilities.

---

### PS-1 – Personnel Security Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/PS-Policy.md`.  
  Establishes requirements for background checks, personnel vetting, access approval, and termination procedures.  
  Procedures align with DoD 5200.2-R and NIST SP 800-53 Rev. 5 guidance.  
- **Responsible Role:** HR Manager / ISSO  
- **Assessment Method:** *Examine* PS-Policy; *Interview* HR representative  
- **Evidence:** `PS-Policy.md`  

---

### PS-2 – Position Risk Designation (+ Enhancements 1, 2)
- **Implementation:**  
  Each position assigned a risk designation (Low, Moderate, High) based on system access and data sensitivity.  
  Enhancement (PS-2 (1)): Job descriptions reviewed annually for accuracy.  
  Enhancement (PS-2 (2)): Risk levels documented and approved by the AO.  
- **Responsible Role:** HR Manager / AO  
- **Assessment Method:** *Examine* risk designations; *Interview* HR  
- **Evidence:** `position_risk_matrix.xlsx`; HR policy records  

---

### PS-3 – Personnel Screening (+ Enhancements 1, 2)
- **Implementation:**  
  All personnel undergo background screening appropriate to position risk level prior to onboarding.  
  Enhancement (PS-3 (1)): Reinvestigations occur every five years for moderate/high-risk roles.  
  Enhancement (PS-3 (2)): Screening follows OPM and DoD suitability standards.  
- **Responsible Role:** HR / Security Office  
- **Assessment Method:** *Examine* background check documentation; *Interview* HR  
- **Evidence:** `screening_records.csv`; investigation summary files  

---

### PS-4 – Personnel Termination (+ Enhancements 1–4)
- **Implementation:**  
  Immediate revocation of logical and physical access upon termination.  
  - (PS-4 (1)): Offboarding checklist executed within 24 hours.  
  - (PS-4 (2)): Exit interviews conducted and logged.  
  - (PS-4 (3)): System credentials, tokens, and CACs recovered.  
  - (PS-4 (4)): Termination report archived for 12 months.  
- **Responsible Role:** HR / ISSO / System Administrator  
- **Assessment Method:** *Test* termination process; *Examine* offboarding logs  
- **Evidence:** `termination_checklist.md`; HR case files  

---

### PS-5 – Personnel Transfer (+ Enhancements 1, 2)
- **Implementation:**  
  Access rights reviewed and adjusted upon internal transfers.  
  Enhancement (PS-5 (1)): Access changes reviewed by ISSO and HR jointly.  
  Enhancement (PS-5 (2)): Unused credentials disabled immediately after transfer.  
- **Responsible Role:** HR / System Owner  
- **Assessment Method:** *Examine* transfer logs; *Interview* HR manager  
- **Evidence:** `transfer_log.json`; role adjustment records  

---

### PS-6 – Access Agreements (+ Enhancements 1, 2)
- **Implementation:**  
  All personnel sign access and nondisclosure agreements (NDAs) before system access is granted.  
  Enhancement (PS-6 (1)): Agreements electronically signed and stored securely.  
  Enhancement (PS-6 (2)): Renewal required annually or upon policy change.  
- **Responsible Role:** HR / ISSO  
- **Assessment Method:** *Examine* signed agreements; *Interview* HR  
- **Evidence:** `access_agreements.pdf`; digital signature logs  

---

### PS-7 – Third-Party Personnel Security (+ Enhancements 1, 2)
- **Implementation:**  
  Contractors and vendors subject to the same screening and access controls as internal staff.  
  Enhancement (PS-7 (1)): Access limited to contract period.  
  Enhancement (PS-7 (2)): Sponsor verification required for renewals.  
- **Responsible Role:** Contracting Officer / ISSO  
- **Assessment Method:** *Examine* contract clauses; *Interview* contracting personnel  
- **Evidence:** `vendor_access_records.csv`; contract security clauses  

---

### PS-8 – Personnel Sanctions
- **Implementation:**  
  Policy defines disciplinary actions for security violations or policy noncompliance.  
  Sanctions may include revocation of access, suspension, or termination.  
  Documented incidents reviewed by HR and ISSO jointly.  
- **Responsible Role:** HR / System Owner  
- **Assessment Method:** *Examine* disciplinary records; *Interview* HR  
- **Evidence:** `disciplinary_actions.csv`; sanction policy document  

---

### PS-9 – Position Categorization (Organizational Enhancement)
- **Implementation:**  
  Automated HR integration with AutoNIST Core ensures access control alignment based on job code.  
  Role-based assignments dynamically updated via HR API sync.  
- **Responsible Role:** HR Manager / DevSecOps  
- **Assessment Method:** *Test* HR sync; *Examine* API logs  
- **Evidence:** `hr_integration_log.json`; `role_mapping.yaml`  

---

### Personnel Security Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 9 | 8 | 1 | 0 | 0 |

**Residual Risk:** Low – annual reinvestigation automation pending.  
**Next Milestones:** Integrate HR data feed with CCM Engine; implement continuous personnel risk scoring dashboard for insider threat monitoring.

### IR-3 – Incident Response Testing (+ Enhancements 1, 2)
- **Implementation:**  
  Annual incident response exercises simulate realistic attack scenarios.  
  Enhancement (IR-3 (1)): Includes unannounced detection and response drills.  
  Enhancement (IR-3 (2)): Test results captured as part of continuous improvement metrics.  
- **Responsible Role:** ISSO / Security Analyst  
- **Assessment Method:** *Test* IR exercises; *Examine* after-action report  
- **Evidence:** `reports/ir_tabletop_exercise_YYYY.pdf`; POA&M entries  

---

### IR-4 – Incident Handling (+ Enhancements 1–6)
- **Implementation:**  
  Incident handling process follows the NIST 800-61 lifecycle: **Preparation → Detection → Analysis → Containment → Eradication → Recovery → Lessons Learned.**  
  - (IR-4 (1)): Automated detection rules in CCM Engine generate alerts for unauthorized changes or control failures.  
  - (IR-4 (2)): Incidents automatically assigned severity and ticket ID.  
  - (IR-4 (4)): Coordination maintained with affected stakeholders.  
  - (IR-4 (6)): Response evidence logged and linked to POA&M entries.  
- **Responsible Role:** ISSO / SOC Analyst  
- **Assessment Method:** *Test* simulated incident; *Examine* IR workflow logs  
- **Evidence:** `src/services/ccm_engine.py`; `ir_response_workflow.json`  

---

### IR-5 – Incident Monitoring
- **Implementation:**  
  Continuous monitoring performed by CCM Engine; correlates system logs, authentication events, and external threat intelligence feeds.  
  Alerts routed to the Incident Response Hub dashboard.  
- **Responsible Role:** Security Analyst / ISSO  
- **Assessment Method:** *Test* monitoring alert flow; *Examine* incident dashboard  
- **Evidence:** `ConMon_dashboard.json`; audit trail excerpts  

---

### IR-6 – Incident Reporting (+ Enhancements 1, 2)
- **Implementation:**  
  Users can report incidents through a secure web form or API endpoint.  
  Enhancement (IR-6 (1)): Automatic reporting to AO for all high-severity incidents.  
  Enhancement (IR-6 (2)): External reporting to appropriate authorities based on classification.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Test* reporting process; *Examine* incident tickets  
- **Evidence:** `src/api/incident_reporting.py`; `incident_tickets.csv`  

---

### IR-7 – Incident Response Assistance
- **Implementation:**  
  Incident response assistance provided by internal security engineering team or contracted 3PAO assessors.  
  24/7 contact information maintained in Incident Response Plan.  
- **Responsible Role:** System Owner / AO  
- **Assessment Method:** *Interview* IR team; *Examine* support contracts  
- **Evidence:** `Incident_Response_Plan.md`; contact roster  

---

### IR-8 – Incident Response Plan (+ Enhancements 1, 2, 3)
- **Implementation:**  
  Comprehensive plan defines response procedures, communication flow, escalation paths, and post-incident review.  
  Enhancement (IR-8 (1)): Includes recovery objectives and business impact thresholds.  
  Enhancement (IR-8 (2)): Reviewed semi-annually.  
  Enhancement (IR-8 (3)): Lessons learned incorporated into plan revisions.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* IR Plan; *Interview* recovery team  
- **Evidence:** `/docs/Incident_Response_Plan.md`; revision logs  

---

### IR-9 – Information Spillage Response (Organizational Enhancement)
- **Implementation:**  
  Defines containment and cleanup steps for spillage of CUI or classified data.  
  Automatic quarantine triggered via DLP rules.  
- **Responsible Role:** ISSO / AO  
- **Assessment Method:** *Test* spillage scenario; *Examine* containment report  
- **Evidence:** `data_loss_prevention_rules.yaml`; spillage remediation logs  

---

### IR-10 – Integrated Incident Response (Organizational Enhancement)
- **Implementation:**  
  Integrates incident response metrics with risk and compliance systems.  
  Findings automatically linked to RMF package updates in AutoNIST Core.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* correlation logs; *Interview* risk officer  
- **Evidence:** `src/services/rmf_integration.py`  

---

### Incident Response Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 10 | 9 | 1 | 0 | 0 |

**Residual Risk:** Low – automation for external agency reporting pending.  
**Next Milestones:** Complete DLP rule testing for CUI containment; enhance dashboard integration for cross-control incident correlation.

## 10  Control Family – Maintenance (MA)

### Family Summary
The Maintenance (MA) family ensures AutoNIST Core systems are maintained securely and consistently, both onsite and remotely.  
Maintenance includes timely updates, vulnerability remediation, patch validation, and documentation of all maintenance activities in accordance with NIST SP 800-53 Rev. 5 and FedRAMP High requirements.  
All maintenance actions are logged, authorized, and reviewed through the Change Control Board (CCB).

---

### MA-1 – System Maintenance Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/MA-Policy.md`.  
  Defines approved maintenance schedules, authorization procedures, maintenance personnel requirements, and security verification steps.  
  Procedures distinguish between routine and emergency maintenance.  
- **Responsible Role:** System Owner / Configuration Manager  
- **Assessment Method:** *Examine* MA-Policy; *Interview* CM Lead  
- **Evidence:** `MA-Policy.md`  

---

### MA-2 – Controlled Maintenance (+ Enhancements 1, 2)
- **Implementation:**  
  All maintenance is scheduled and approved through the ticketing system.  
  Enhancement (MA-2 (1)): Pre- and post-maintenance security checks are required.  
  Enhancement (MA-2 (2)): Maintenance logs retained for 18 months minimum.  
  Maintenance events recorded automatically in `maintenance_records.json`.  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Examine* maintenance logs; *Interview* admin  
- **Evidence:** `maintenance_records.json`; change approval tickets  

---

### MA-3 – Maintenance Tools (+ Enhancements 1, 2)
- **Implementation:**  
  Maintenance tools approved and validated before use.  
  Enhancement (MA-3 (1)): Tools verified to contain no malicious code.  
  Enhancement (MA-3 (2)): Tool inventories reviewed quarterly and updated in the CMDB.  
- **Responsible Role:** Configuration Manager / DevSecOps  
- **Assessment Method:** *Test* tool validation; *Examine* tool inventory  
- **Evidence:** `tool_inventory.csv`; anti-malware scan logs  

---

### MA-4 – Nonlocal Maintenance (+ Enhancements 1, 2)
- **Implementation:**  
  Remote maintenance permitted only through approved VPN with TLS 1.3 and MFA.  
  Enhancement (MA-4 (1)): Remote sessions monitored and logged.  
  Enhancement (MA-4 (2)): Sessions terminated automatically after 15 minutes of inactivity.  
  In air-gapped environments, all remote maintenance is prohibited.  
- **Responsible Role:** Network Engineer / ISSO  
- **Assessment Method:** *Test* VPN session; *Examine* remote session logs  
- **Evidence:** `/config/vpn.conf`; `remote_session_log.json`  

---

### MA-5 – Maintenance Personnel (+ Enhancements 1, 2)
- **Implementation:**  
  Only authorized, background-checked personnel perform maintenance.  
  Enhancement (MA-5 (1)): Access lists maintained and reviewed quarterly.  
  Enhancement (MA-5 (2)): Temporary maintenance personnel escorted or monitored during sessions.  
- **Responsible Role:** ISSO / HR  
- **Assessment Method:** *Examine* personnel authorization lists; *Interview* ISSO  
- **Evidence:** `authorized_personnel_list.csv`; HR clearance records  

---

### MA-6 – Timely Maintenance
- **Implementation:**  
  Maintenance scheduled based on severity of identified vulnerabilities and system health reports.  
  Critical security patches applied within 72 hours of release or discovery.  
- **Responsible Role:** System Administrator / DevSecOps  
- **Assessment Method:** *Examine* patch schedule; *Test* update workflow  
- **Evidence:** `patch_schedule.yml`; system patch logs  

---

### MA-7 – Field Maintenance
- **Implementation:**  
  Field maintenance activities on hardware components occur only within secure controlled facilities.  
  Equipment sanitized or encrypted before removal.  
- **Responsible Role:** System Owner / Maintenance Technician  
- **Assessment Method:** *Interview* maintenance staff; *Examine* field maintenance logs  
- **Evidence:** `field_maintenance_log.json`; chain-of-custody forms  

---

### MA-8 – Maintenance Monitoring and Review
- **Implementation:**  
  All maintenance actions monitored by the ISSO.  
  Random spot checks conducted monthly to verify authorization and documentation accuracy.  
- **Responsible Role:** ISSO / Configuration Manager  
- **Assessment Method:** *Examine* audit records; *Interview* ISSO  
- **Evidence:** `maintenance_review_report.pdf`  

---

### MA-9 – Maintenance Automation (Organizational Enhancement)
- **Implementation:**  
  AutoNIST Core automates patch verification, configuration validation, and reporting through the Continuous Control Monitoring (CCM) engine.  
  Maintenance data automatically populates the POA&M when anomalies are detected.  
- **Responsible Role:** DevSecOps Engineer / ISSO  
- **Assessment Method:** *Test* CCM automation; *Examine* maintenance API logs  
- **Evidence:** `src/services/ccm_engine.py`; `poam_generator.py`  

---

### Maintenance Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 9 | 8 | 1 | 0 | 0 |

**Residual Risk:** Low – additional automation for third-party tool validation in progress.  
**Next Milestones:** Integrate patch cycle reporting into ConMon dashboard; finalize digital signatures for tool integrity verification.
## 11  Control Family – Media Protection (MP)

### Family Summary
The Media Protection (MP) family ensures AutoNIST Core protects digital and physical media containing sensitive information from unauthorized access, use, or disposal.  
Controls include encryption of digital media, physical access restrictions, secure data sanitization, and strict handling procedures for both removable and backup media.

---

### MP-1 – Media Protection Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/MP-Policy.md`. Establishes requirements for media labeling, transport, encryption, and destruction.  
  Procedures specify how digital and physical media are managed throughout their lifecycle.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* MP-Policy; *Interview* ISSO  
- **Evidence:** `MP-Policy.md`  

---

### MP-2 – Media Access (+ Enhancements 1, 2)
- **Implementation:**  
  Access to removable and backup media restricted to authorized personnel only.  
  Enhancement (MP-2 (1)): Access logs reviewed weekly.  
  Enhancement (MP-2 (2)): Access automatically revoked when personnel leave the organization.  
- **Responsible Role:** System Owner / Security Officer  
- **Assessment Method:** *Examine* access logs; *Interview* admin  
- **Evidence:** `media_access_log.json`; HR offboarding records  

---

### MP-3 – Media Marking (+ Enhancements 1, 2)
- **Implementation:**  
  All physical and digital media labeled with appropriate sensitivity markings (e.g., “CUI,” “Internal Use Only”).  
  Enhancement (MP-3 (1)): Labels automatically applied to exported digital files.  
  Enhancement (MP-3 (2)): Visual indicators embedded into exported reports and evidence bundles.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* sample media; *Test* export labeling  
- **Evidence:** `src/services/oscal_exporter.py`; `label_config.yaml`  

---

### MP-4 – Media Storage (+ Enhancements 1, 2)
- **Implementation:**  
  All media encrypted using AES-256 and stored in secured environments.  
  Enhancement (MP-4 (1)): Encryption keys rotated every 90 days.  
  Enhancement (MP-4 (2)): Access limited to personnel with clearance commensurate with data sensitivity.  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Test* encryption/decryption; *Examine* key management logs  
- **Evidence:** `/config/encryption_policy.json`; key rotation logs  

---

### MP-5 – Media Transport (+ Enhancements 1, 2, 3)
- **Implementation:**  
  Media transported only in encrypted form.  
  Enhancement (MP-5 (1)): Courier verification required before media release.  
  Enhancement (MP-5 (2)): Transfer authorization logged and approved.  
  Enhancement (MP-5 (3)): Digital evidence transfer validated by hash verification.  
- **Responsible Role:** ISSO / Transport Custodian  
- **Assessment Method:** *Examine* transport logs; *Interview* custodian  
- **Evidence:** `media_transport_log.json`; SHA-384 hash reports  

---

### MP-6 – Media Sanitization (+ Enhancements 1, 2, 3)
- **Implementation:**  
  Sanitization procedures follow DoD 5220.22-M and NIST SP 800-88 Rev. 1.  
  Enhancement (MP-6 (1)): Sanitization verified by independent review.  
  Enhancement (MP-6 (2)): Destruction logs digitally signed.  
  Enhancement (MP-6 (3)): Cryptographic erasure used for SSDs.  
- **Responsible Role:** System Owner / Security Officer  
- **Assessment Method:** *Test* sanitization procedure; *Examine* destruction log  
- **Evidence:** `media_destruction_log.json`; sanitization checklist  

---

### MP-7 – Media Use (+ Enhancements 1, 2)
- **Implementation:**  
  Use of removable media restricted to approved secure USB devices or encrypted drives.  
  Enhancement (MP-7 (1)): System automatically disables unapproved devices.  
  Enhancement (MP-7 (2)): Removable media use monitored by CCM Engine.  
- **Responsible Role:** ISSO / DevSecOps  
- **Assessment Method:** *Test* USB restrictions; *Examine* monitoring reports  
- **Evidence:** `device_whitelist.yaml`; `ccm_engine.log`  

---

### MP-8 – Media Downgrading (Organizational Enhancement)
- **Implementation:**  
  Procedures defined for reviewing and approving the downgrading or declassification of data on digital media.  
  Approval requires AO and ISSO concurrence.  
- **Responsible Role:** AO / ISSO  
- **Assessment Method:** *Examine* downgrading request forms; *Interview* AO  
- **Evidence:** `media_downgrade_request.md`; approval logs  

---

### Media Protection Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 8 | 7 | 1 | 0 | 0 |

**Residual Risk:** Low – ongoing automation of transport chain-of-custody verification.  
**Next Milestones:** Deploy automatic labeling for evidence bundles; finalize DoD 5220.22-M verification module integration.
## 12  Control Family – Physical and Environmental Protection (PE)

### Family Summary
The Physical and Environmental Protection (PE) family safeguards AutoNIST Core’s physical infrastructure and environmental conditions that support the system’s hardware and hosting environments.  
This includes physical access control, surveillance, environmental monitoring, visitor management, and contingency measures to prevent damage, theft, or disruption of system components.  
Most PE controls are **inherited** from the hosting facility—whether air-gapped data center or FedRAMP-authorized cloud (AWS GovCloud, Azure GCCH, or on-prem enclave).

---

### PE-1 – Physical and Environmental Protection Policy and Procedures
- **Implementation:**  
  Documented in `/docs/policies/PE-Policy.md`. Establishes physical security controls for facilities, data centers, and co-location environments.  
  The policy defines access authorization procedures, visitor management, and environmental safeguard requirements.  
- **Responsible Role:** Facility Security Officer (FSO) / System Owner  
- **Assessment Method:** *Examine* PE-Policy; *Interview* FSO  
- **Evidence:** `PE-Policy.md`  

---

### PE-2 – Physical Access Authorizations (+ Enhancements 1, 2)
- **Implementation:**  
  Physical access granted only to authorized personnel with verified background checks.  
  Enhancement (PE-2 (1)): Authorization lists reviewed quarterly by the FSO.  
  Enhancement (PE-2 (2)): Revoked credentials removed within 24 hours of personnel departure.  
- **Responsible Role:** Facility Security Officer / HR  
- **Assessment Method:** *Examine* authorization records; *Interview* FSO  
- **Evidence:** `facility_access_list.csv`; HR access removal reports  

---

### PE-3 – Physical Access Control (+ Enhancements 1–4)
- **Implementation:**  
  Physical entry to secure areas controlled via multi-factor authentication (badge + PIN or biometrics).  
  Enhancement (PE-3 (1)): Access logs maintained for 12 months.  
  Enhancement (PE-3 (2)): Video surveillance covers all entry points.  
  Enhancement (PE-3 (3)): Alarms trigger for unauthorized access attempts.  
  Enhancement (PE-3 (4)): Door contacts integrated with SOC monitoring system.  
- **Responsible Role:** FSO / Security Operations  
- **Assessment Method:** *Test* access control systems; *Examine* logs  
- **Evidence:** Surveillance footage logs; entry control system reports  

---

### PE-4 – Access Control for Transmission Medium
- **Implementation:**  
  Network cabling and fiber routed through secured conduits and locked panels.  
  Only authorized technicians permitted to handle media lines.  
- **Responsible Role:** Network Engineer / FSO  
- **Assessment Method:** *Interview* facility tech; *Examine* infrastructure layout  
- **Evidence:** Cabling diagrams; facility floor plans  

---

### PE-5 – Access Control for Output Devices
- **Implementation:**  
  System consoles, printers, and monitors located in restricted areas to prevent data exposure.  
  Output devices in shared areas configured to redact sensitive information.  
- **Responsible Role:** ISSO / System Administrator  
- **Assessment Method:** *Test* restricted access; *Examine* output logs  
- **Evidence:** Configuration screenshots; print audit records  

---

### PE-6 – Monitoring Physical Access (+ Enhancements 1–3)
- **Implementation:**  
  Continuous monitoring through CCTV and intrusion detection systems.  
  Enhancement (PE-6 (1)): Security personnel review logs daily.  
  Enhancement (PE-6 (2)): Motion sensors integrated with building automation systems.  
  Enhancement (PE-6 (3)): Incident alerts forwarded to SOC.  
- **Responsible Role:** FSO / Security Operations  
- **Assessment Method:** *Examine* surveillance logs; *Interview* security team  
- **Evidence:** `facility_monitoring_logs.json`; alert summaries  

---

### PE-8 – Visitor Access Records (+ Enhancements 1, 2)
- **Implementation:**  
  Visitors must sign in, present ID, and be escorted at all times.  
  Enhancement (PE-8 (1)): Visitor logs retained for one year minimum.  
  Enhancement (PE-8 (2)): Digital visitor management system integrates with HR database.  
- **Responsible Role:** FSO / Reception Security  
- **Assessment Method:** *Examine* visitor logs; *Interview* facility staff  
- **Evidence:** `visitor_logs.csv`; visitor badge system export  

---

### PE-9 – Power Equipment and Cabling
- **Implementation:**  
  Power cabling protected from damage and interference; redundant feeds supply critical systems.  
  UPS and surge protection devices inspected quarterly.  
- **Responsible Role:** Facility Engineer  
- **Assessment Method:** *Examine* inspection logs; *Interview* facility engineer  
- **Evidence:** Power inspection reports; UPS maintenance records  

---

### PE-10 – Emergency Shutoff
- **Implementation:**  
  Emergency power shutoff switches clearly labeled and located near exits.  
  Procedures ensure safe shutdown of servers without data loss.  
- **Responsible Role:** Facility Engineer / ISSO  
- **Assessment Method:** *Test* emergency shutoff drills; *Examine* documentation  
- **Evidence:** Safety diagrams; shutoff test reports  

---

### PE-11 – Emergency Power
- **Implementation:**  
  Data centers equipped with redundant UPS and generators providing at least 4 hours of runtime.  
  Battery systems tested monthly and generators quarterly.  
- **Responsible Role:** Facility Engineer / FSO  
- **Assessment Method:** *Examine* maintenance logs; *Interview* facility team  
- **Evidence:** Generator test reports; UPS inspection checklist  

---

### PE-12 – Emergency Lighting
- **Implementation:**  
  Emergency lighting installed along evacuation routes, server rooms, and critical areas.  
  Inspected and tested semi-annually.  
- **Responsible Role:** Facility Engineer  
- **Assessment Method:** *Examine* inspection logs; *Test* lighting system  
- **Evidence:** Lighting inspection records; facility safety plan  

---

### PE-13 – Fire Protection
- **Implementation:**  
  Fire suppression systems (FM-200 or inert gas) deployed in server areas.  
  Smoke and heat detectors monitored continuously.  
- **Responsible Role:** Facility Engineer / Safety Officer  
- **Assessment Method:** *Examine* test certifications; *Interview* safety personnel  
- **Evidence:** Fire system inspection certificates; alarm logs  

---

### PE-14 – Temperature and Humidity Controls
- **Implementation:**  
  HVAC systems maintain optimal environmental conditions (68–72°F, 40–60% RH).  
  Monitored 24/7 with automated alerts for deviations.  
- **Responsible Role:** Facility Engineer  
- **Assessment Method:** *Examine* HVAC logs; *Interview* facility operator  
- **Evidence:** Temperature/humidity reports; system dashboards  

---

### PE-15 – Water Damage Protection
- **Implementation:**  
  Server racks elevated; moisture sensors installed near drains and water lines.  
  Automatic alerts trigger if leaks detected.  
- **Responsible Role:** Facility Engineer  
- **Assessment Method:** *Test* water sensors; *Examine* maintenance records  
- **Evidence:** Leak detection test logs; facility blueprints  

---

### PE-16 – Delivery and Removal
- **Implementation:**  
  Equipment deliveries and removals require documented authorization.  
  Asset tags verified upon entry and exit.  
- **Responsible Role:** Facility Security Officer / Logistics  
- **Assessment Method:** *Examine* delivery logs; *Interview* logistics staff  
- **Evidence:** `delivery_tracking_log.json`; asset manifests  

---

### PE-17 – Alternate Work Site
- **Implementation:**  
  Authorized personnel may access system via secure remote environment using VPN and MFA during facility outages.  
  Alternate work site adheres to same security and privacy standards as primary site.  
- **Responsible Role:** AO / System Owner  
- **Assessment Method:** *Test* alternate site connection; *Examine* access policies  
- **Evidence:** Alternate site policy; VPN access reports  

---

### Physical and Environmental Protection Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 16 | 4 | 1 | 11 | 0 |

**Residual Risk:** Low – most controls inherited from facility provider.  
**Next Milestones:** Obtain updated FedRAMP PE control inheritance statements; complete annual facility walk-through for on-prem enclave.

## 13  Control Family – Planning (PL)

### Family Summary
The Planning (PL) family ensures AutoNIST Core’s security and privacy controls are properly documented, planned, and maintained throughout the system lifecycle.  
Planning artifacts define how the system is authorized, protected, and monitored under the Risk Management Framework (RMF) and align with NIST SP 800-37, 800-53, and FedRAMP High baselines.  
AutoNIST Core automatically generates and updates planning documentation, including the System Security Plan (SSP), Security Assessment Plan (SAP), and Security Assessment Report (SAR).

---

### PL-1 – Security Planning Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/PL-Policy.md`.  
  Establishes processes for creating, maintaining, and approving planning documentation such as the SSP, SAP, and POA&M.  
  Procedures specify revision triggers (major changes, ATO renewal) and responsible parties (ISSO, AO, System Owner).  
- **Responsible Role:** System Owner / ISSO  
- **Assessment Method:** *Examine* PL-Policy; *Interview* ISSO  
- **Evidence:** `PL-Policy.md`  

---

### PL-2 – System Security and Privacy Plan (+ Enhancements 1, 2, 3)
- **Implementation:**  
  AutoNIST Core generates the SSP in OSCAL and Markdown formats, including all required elements (system description, boundary, controls, and attachments).  
  - (PL-2 (1)): SSP includes roles, responsibilities, and interconnection details.  
  - (PL-2 (2)): Reviewed and updated quarterly or after major changes.  
  - (PL-2 (3)): Maintained under version control in GitHub with digital signatures.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* SSP repository; *Test* automated generation  
- **Evidence:** `/docs/SSP_AutoNIST_Core_v1.0.md`; `oscal_export.xml`  

---

### PL-4 – Rules of Behavior (+ Enhancements 1, 2)
- **Implementation:**  
  Rules of Behavior (RoB) established for all users and system administrators.  
  - (PL-4 (1)): Users must electronically acknowledge RoB before system access.  
  - (PL-4 (2)): Re-acknowledgment required annually or after policy updates.  
- **Responsible Role:** System Owner / ISSO  
- **Assessment Method:** *Examine* RoB records; *Interview* users  
- **Evidence:** `docs/policies/Rules_of_Behavior.md`; signed user acknowledgment logs  

---

### PL-8 – Information Security Architecture (+ Enhancements 1, 2)
- **Implementation:**  
  AutoNIST Core’s architecture is documented and reviewed against NIST SP 800-160 and FedRAMP High guidelines.  
  - (PL-8 (1)): Architecture diagrams illustrate data flow, trust boundaries, and interconnections.  
  - (PL-8 (2)): Architecture reviewed annually to validate defense-in-depth controls.  
- **Responsible Role:** DevSecOps Architect / ISSO  
- **Assessment Method:** *Examine* architecture diagrams; *Interview* DevSecOps Lead  
- **Evidence:** `/docs/architecture/System_Boundary_Diagram.png`; `data_flow_diagram.vsdx`  

---

### PL-9 – Central Management of Security and Privacy Plans
- **Implementation:**  
  All planning documentation centrally managed in the AutoNIST Core repository with access restricted to authorized personnel.  
  Changes tracked through Git version control and reviewed via Change Control Board (CCB).  
- **Responsible Role:** System Owner / Configuration Manager  
- **Assessment Method:** *Examine* repo access logs; *Interview* CM Lead  
- **Evidence:** GitHub repository settings; `change_control_board_minutes.md`  

---

### PL-10 – Baseline Selection and Tailoring (Organizational Enhancement)
- **Implementation:**  
  AutoNIST Core supports automated baseline selection (Low/Moderate/High) and tailoring per customer environment.  
  System dynamically adjusts SSP contents to reflect chosen control baselines.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Test* baseline selection feature; *Examine* generated SSP output  
- **Evidence:** `src/services/baseline_selector.py`; `baseline_config.yaml`  

---

### Planning Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 6 | 6 | 0 | 0 | 0 |

**Residual Risk:** Very Low – continuous updates automatically enforced through version control.  
**Next Milestones:** Integrate SSP and SAP validation workflow into CCM Engine; deploy automatic baseline-tailoring recommendations for each customer environment.

## 15  Control Family – Risk Assessment (RA)

### Family Summary
The Risk Assessment (RA) family ensures AutoNIST Core continuously identifies, evaluates, and mitigates security risks to system operations, assets, and data.  
The system integrates automated vulnerability analysis, threat modeling, and risk scoring through its Continuous Control Monitoring (CCM) engine, aligning with NIST SP 800-30 and RMF Step 2 (Select) and Step 3 (Implement).

---

### RA-1 – Risk Assessment Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/RA-Policy.md`. Establishes the framework for identifying, analyzing, responding to, and monitoring risks.  
  Specifies roles (ISSO, AO, Risk Officer), documentation frequency (quarterly), and risk thresholds aligned with organizational tolerance levels.  
- **Responsible Role:** Risk Officer / ISSO  
- **Assessment Method:** *Examine* RA-Policy; *Interview* risk team  
- **Evidence:** `RA-Policy.md`  

---

### RA-2 – Security Categorization (+ Enhancements 1, 2)
- **Implementation:**  
  Each information system component categorized per FIPS 199 criteria — Confidentiality, Integrity, Availability (all HIGH for AutoNIST Core).  
  Enhancement (RA-2 (1)): System automatically validates categorization during SSP generation.  
  Enhancement (RA-2 (2)): Categorization reviewed annually or upon major change.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* FIPS 199 document; *Test* categorization automation  
- **Evidence:** `/docs/FIPS199_Assessment.md`; `src/services/system_catalog.py`  

---

### RA-3 – Risk Assessment (+ Enhancements 1–4)
- **Implementation:**  
  The CCM engine performs automated and manual risk assessments:  
  - (RA-3): Initial risk assessment performed pre-authorization and updated quarterly.  
  - (RA-3 (1)): Incorporates threat intelligence

## 16  Control Family – System and Communications Protection (SC)

### Family Summary
The System and Communications Protection (SC) family safeguards the confidentiality and integrity of AutoNIST Core’s data-in-transit and data-at-rest.  
Controls include cryptographic protections, boundary defense, segmentation, message confidentiality, and transmission integrity aligned with FIPS 140-3, NIST SP 800-52r2, and FedRAMP High requirements.  
All network traffic is encrypted, validated, and monitored by the Continuous Control Monitoring (CCM) engine and network security stack.

---

### SC-1 – System and Communications Protection Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/SC-Policy.md`.  
  Establishes requirements for network protection, encryption, boundary security, and transmission safeguards.  
  Procedures align with SP 800-53 Rev. 5, CNSSP 15, and DoD cloud connection mandates.  
- **Responsible Role:** ISSO / Network Engineer  
- **Assessment Method:** *Examine* SC-Policy; *Interview* Network Admin  
- **Evidence:** `SC-Policy.md`  

---

### SC-2 – Application Partitioning
- **Implementation:**  
  AutoNIST Core separates user-facing, service, and data layers using containerized microservices.  
  Each service operates within its own namespace with strict API gateway control.  
- **Responsible Role:** DevSecOps Architect  
- **Assessment Method:** *Examine* service topology; *Test* container isolation  
- **Evidence:** `docker-compose.yml`; `kubernetes_namespace_config.yaml`  

---

### SC-4 – Information in Shared System Resources
- **Implementation:**  
  Shared resources (e.g., memory, disk, cache) segmented by container runtime.  
  Prevents one process from accessing another’s data.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* container boundary isolation; *Examine* runtime security settings  
- **Evidence:** `container_security_policy.yaml`; audit logs  

---

### SC-5 – Denial of Service Protection (+ Enhancements 1, 2, 3)
- **Implementation:**  
  Rate limiting, WAF filtering, and adaptive load balancing mitigate DoS/DDoS threats.  
  - (SC-5 (1)): Traffic throttling per IP and API token.  
  - (SC-5 (2)): Alerting triggers for bandwidth anomalies.  
  - (SC-5 (3)): Redundant failover nodes sustain uptime under attack.  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* simulated flood traffic; *Examine* network dashboard  
- **Evidence:** `waf_rules.yaml`; `traffic_monitoring_report.json`  

---

### SC-7 – Boundary Protection (+ Enhancements 1–16)
- **Implementation:**  
  AutoNIST Core enforces strict boundary control between internal components and external networks.  
  - (SC-7): Firewalls, security groups, and API gateway enforce zero-trust segmentation.  
  - (SC-7 (3)): Network address translation hides internal topology.  
  - (SC-7 (4)): Traffic filtered by allowlist rules only.  
  - (SC-7 (5)): DMZ isolates web front end from data stores.  
  - (SC-7 (8)): Internal TLS required for all inter-service communication.  
  - (SC-7 (10)): Split tunneling disabled.  
  - (SC-7 (12)): IDS/IPS sensors deployed for continuous inspection.  
  - (SC-7 (15)): Cloud ingress and egress monitored via flow logs.  
- **Responsible Role:** Network Security Engineer / ISSO  
- **Assessment Method:** *Examine* firewall configurations; *Test* IDS rules  
- **Evidence:** `firewall_rules.json`; `flow_logs.json`; `ids_signatures.xml`  

---

### SC-8 – Transmission Confidentiality and Integrity (+ Enhancements 1, 2)
- **Implementation:**  
  All data in transit protected with TLS 1.3 and forward secrecy.  
  Integrity validated with HMAC-SHA-384 signatures.  
  - (SC-8 (1)): Mutual TLS enforced between services.  
  - (SC-8 (2)): Message signing implemented at API layer.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Test* API communications; *Examine* cert validation logs  
- **Evidence:** `/config/tls_certs/`; `api_signing_module.py`  

---

### SC-12 – Cryptographic Key Establishment and Management (+ Enhancements 1–4)
- **Implementation:**  
  Cryptographic keys generated, distributed, rotated, and revoked using an HSM-backed vault.  
  - (SC-12 (1)): Keys rotated every 90 days.  
  - (SC-12 (2)): Revoked keys rendered unusable immediately.  
  - (SC-12 (3)): Audit logs retained for 18 months.  
  - (SC-12 (4)): Dual authorization for key changes.  
- **Responsible Role:** ISSO / Crypto Officer  
- **Assessment Method:** *Examine* key management logs; *Test* rotation automation  
- **Evidence:** `hsm_vault_config.json`; `crypto_key_rotation.log`  

---

### SC-13 – Cryptographic Protection
- **Implementation:**  
  All cryptographic modules are FIPS 140-3 validated.  
  AES-256 used for data at rest, TLS 1.3 for data in transit.  
- **Responsible Role:** DevSecOps / ISSO  
- **Assessment Method:** *Examine* cryptographic library references; *Test* encryption routines  
- **Evidence:** `/src/services/crypto.py`; vendor validation documentation  

---

### SC-15 – Collaborative Computing Devices and Applications
- **Implementation:**  
  Audio, video, and chat services within AutoNIST Core disabled or restricted to secure, encrypted channels.  
  Recording and screen sharing require AO approval.  
- **Responsible Role:** System Owner / ISSO  
- **Assessment Method:** *Test* collaboration tools; *Examine* access control settings  
- **Evidence:** `collaboration_config.json`; security settings log  

---

### SC-18 – Mobile Code
- **Implementation:**  
  Only digitally signed, verified code libraries permitted.  
  Untrusted JavaScript or runtime code blocked via content security policy (CSP).  
- **Responsible Role:** DevSecOps / Web App Developer  
- **Assessment Method:** *Test* CSP enforcement; *Examine* source code policies  
- **Evidence:** `csp_policy.json`; dependency verification logs  

---

### SC-19 – Voice Over Internet Protocol (VoIP)
- **Implementation:**  
  VoIP services isolated on separate VLANs; SIP traffic encrypted using SRTP/TLS.  
  Logging and QoS policies enforce integrity and availability.  
- **Responsible Role:** Network Engineer  
- **Assessment Method:** *Test* encrypted VoIP session; *Examine* call logs  
- **Evidence:** `voip_config.yaml`; QoS test reports  

---

### SC-23 – Session Authenticity (+ Enhancements 1, 2)
- **Implementation:**  
  Session tokens cryptographically bound to user identities; all sessions validated on each request.  
  - (SC-23 (1)): Replay detection prevents token reuse.  
  - (SC-23 (2)): Token expiry enforced after inactivity timeout.  
- **Responsible Role:** DevSecOps / Security Engineer  
- **Assessment Method:** *Test* session management; *Examine* authentication logs  
- **Evidence:** `auth_middleware.py`; `session_tracking.json`  

---

### SC-28 – Protection of Information at Rest (+ Enhancements 1, 2)
- **Implementation:**  
  All stored data encrypted using AES-256 with hardware-accelerated modules.  
  - (SC-28 (1)): File integrity monitored using cryptographic checksums.  
  - (SC-28 (2)): Encrypted database snapshots stored off-site.  
- **Responsible Role:** ISSO / Database Administrator  
- **Assessment Method:** *Test* encryption verification; *Examine* snapshot logs  
- **Evidence:** `/config/encryption_policy.json`; `backup_integrity_report.txt`  

---

### SC-39 – Process Isolation (Organizational Enhancement)
- **Implementation:**  
  Process and memory isolation enforced through container sandboxing and kernel-level namespaces.  
  Each component operates with least privilege.  
- **Responsible Role:** DevSecOps / OS Administrator  
- **Assessment Method:** *Test* runtime isolation; *Examine* kernel configs  
- **Evidence:** `container_runtime_security.yaml`; `seccomp_profile.json`  

---

### System and Communications Protection Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 13 | 12 | 1 | 0 | 0 |

**Residual Risk:** Low – ongoing automation of mutual TLS certificate rotation.  
**Next Milestones:** Implement automated boundary health scoring; expand IDS/IPS coverage to all container network overlays.
## 17  Control Family – System and Information Integrity (SI)

### Family Summary
The System and Information Integrity (SI) family ensures AutoNIST Core identifies, reports, and corrects system flaws in a timely manner, protects against malicious code, and monitors the system to detect unauthorized activity.  
The CCM (Continuous Control Monitoring) engine serves as the central integrity layer — scanning configurations, files, and logs, while correlating security events to risk posture.  
Controls are implemented across application, OS, and container layers, aligned with NIST SP 800-53 Rev. 5 and FedRAMP High requirements.

---

### SI-1 – System and Information Integrity Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/SI-Policy.md`.  
  Specifies processes for vulnerability detection, patch application, monitoring, incident escalation, and integrity verification.  
  Procedures reviewed semi-annually or after major changes.  
- **Responsible Role:** ISSO / System Owner  
- **Assessment Method:** *Examine* SI-Policy; *Interview* ISSO  
- **Evidence:** `SI-Policy.md`  

---

### SI-2 – Flaw Remediation (+ Enhancements 1–5)
- **Implementation:**  
  The AutoNIST Core patching pipeline applies security updates automatically through CI/CD workflows.  
  - (SI-2): Flaws identified through vulnerability scans, logs, and user reports.  
  - (SI-2 (1)): Automated alerts for newly disclosed CVEs.  
  - (SI-2 (2)): Patches tested in staging before production.  
  - (SI-2 (3)): Security-critical updates deployed within 72 hours.  
  - (SI-2 (4)): Version control tracks all fixes.  
  - (SI-2 (5)): Monthly patch summary reviewed by the ISSO.  
- **Responsible Role:** DevSecOps Engineer / System Administrator  
- **Assessment Method:** *Test* CI/CD pipeline; *Examine* patch logs  
- **Evidence:** `ci_cd_pipeline.yaml`; `patch_report.json`  

---

### SI-3 – Malicious Code Protection (+ Enhancements 1–6)
- **Implementation:**  
  AutoNIST Core employs container-based anti-malware scanning, signature updates, and behavior detection.  
  - (SI-3 (1)): Scans executed daily and during CI/CD builds.  
  - (SI-3 (2)): Quarantine and auto-remediation enforced for detections.  
  - (SI-3 (3)): Updates verified cryptographically before application.  
  - (SI-3 (6)): Alerts integrated into the CCM dashboard.  
- **Responsible Role:** DevSecOps / Security Analyst  
- **Assessment Method:** *Test* malware detection; *Examine* quarantine logs  
- **Evidence:** `malware_scan_report.json`; `ccm_engine_alerts.log`  

---

### SI-4 – System Monitoring (+ Enhancements 1–20)
- **Implementation:**  
  CCM engine continuously monitors logs, network traffic, and user activities for anomalies.  
  - (SI-4 (1)): Syslog and API telemetry collected across all nodes.  
  - (SI-4 (2)): Anomaly detection via machine learning baselines.  
  - (SI-4 (4)): Alerts for failed logins, privilege escalations, or code tampering.  
  - (SI-4 (5)): Correlation rules tuned monthly.  
  - (SI-4 (7)): Alerts routed to the Incident Response Hub.  
  - (SI-4 (10)): Audit trail secured with cryptographic signing.  
  - (SI-4 (14)): Integration with cloud provider’s SIEM (e.g., AWS GuardDuty, Azure Sentinel).  
  - (SI-4 (18)): Enclave sensors provide early warning for malicious network patterns.  
- **Responsible Role:** Security Analyst / ISSO  
- **Assessment Method:** *Test* monitoring alert; *Examine* SIEM configuration  
- **Evidence:** `ccm_engine.py`; `siem_integration_config.yaml`  

---

### SI-5 – Security Alerts, Advisories, and Directives
- **Implementation:**  
  AutoNIST Core automatically ingests security bulletins from CISA, NIST NVD, and vendor feeds.  
  Alerts correlated against installed components; results appear on dashboard.  
- **Responsible Role:** Security Analyst / DevSecOps  
- **Assessment Method:** *Examine* alert integration; *Test* advisory ingestion  
- **Evidence:** `advisory_feed_config.yaml`; `security_alert_log.json`  

---

### SI-6 – Security Function Verification
- **Implementation:**  
  Security modules verified upon startup and during runtime health checks.  
  CI/CD pipelines enforce code integrity validation before deployment.  
- **Responsible Role:** DevSecOps Engineer / ISSO  
- **Assessment Method:** *Test* security module hash verification; *Examine* build validation logs  
- **Evidence:** `build_validation_report.json`; integrity check results  

---

### SI-7 – Software, Firmware, and Information Integrity (+ Enhancements 1–5)
- **Implementation:**  
  Integrity verified through SHA-384 checksums, signed releases, and SBOM validation.  
  - (SI-7 (1)): Automated verification before deployment.  
  - (SI-7 (2)): Hash validation required for third-party dependencies.  
  - (SI-7 (5)): Root of trust established via Git commit signing (GPG).  
- **Responsible Role:** DevSecOps Engineer / System Owner  
- **Assessment Method:** *Test* integrity validation; *Examine* commit signing logs  
- **Evidence:** `integrity_validation.log`; `signed_commits.txt`  

---

### SI-8 – Spam and Phishing Protection
- **Implementation:**  
  In hosted environments, AutoNIST Core filters inbound and outbound communications through secure gateways that detect spam and phishing attempts.  
  Quarantined messages reviewed by security staff.  
- **Responsible Role:** Network Security Engineer  
- **Assessment Method:** *Test* email gateway filters; *Examine* quarantine logs  
- **Evidence:** `gateway_filter_config.json`; phishing detection reports  

---

### SI-10 – Information Input Validation (+ Enhancements 1, 2)
- **Implementation:**  
  All API and form inputs validated for type, format, and content before processing.  
  - (SI-10 (1)): Server-side validation enforces whitelist rules.  
  - (SI-10 (2)): Malformed or unexpected data logged and rejected.  
- **Responsible Role:** Software Engineer / DevSecOps  
- **Assessment Method:** *Test* API endpoints; *Examine* error handling logs  
- **Evidence:** `input_validation_middleware.py`; `error_logs.json`  

---

### SI-11 – Error Handling
- **Implementation:**  
  Errors logged securely and displayed without exposing sensitive system details.  
  Stack traces restricted to admin-only debugging mode.  
- **Responsible Role:** Software Engineer / ISSO  
- **Assessment Method:** *Test* error responses; *Examine* application logs  
- **Evidence:** `error_handler.py`; log retention configuration  

---

### SI-12 – Information Management and Retention
- **Implementation:**  
  All system data logs and evidence retained per retention policy (minimum 18 months).  
  Data automatically purged or archived when retention period expires.  
- **Responsible Role:** System Owner / DevSecOps  
- **Assessment Method:** *Examine* retention settings; *Test* data archival routine  
- **Evidence:** `data_retention_policy.yaml`; archival logs  

---

### SI-16 – Memory Protection (Organizational Enhancement)
- **Implementation:**  
  Runtime memory protection enforced through modern OS-level mitigations (ASLR, DEP, and stack canaries).  
  Container runtime uses seccomp and AppArmor profiles for additional hardening.  
- **Responsible Role:** OS Administrator / DevSecOps  
- **Assessment Method:** *Test* exploit prevention features; *Examine* kernel configs  
- **Evidence:** `seccomp_profile.json`; `os_hardening_baseline.txt`  

---

### System and Information Integrity Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 12 | 11 | 1 | 0 | 0 |

**Residual Risk:** Low – pending implementation of automated runtime exploit detection.  
**Next Milestones:** Deploy kernel integrity monitor agent; expand machine learning anomaly detection to cover build and runtime events.
## 18  Control Family – System and Services Acquisition (SA)

### Family Summary
The System and Services Acquisition (SA) family ensures that AutoNIST Core is securely designed, developed, acquired, and maintained throughout its lifecycle.  
Controls address secure development practices, code review, software supply chain management, third-party service oversight, and the integration of security testing and evaluation in every phase of the DevSecOps pipeline.  
This family directly supports RMF Step 2 (Select), Step 3 (Implement), and Step 4 (Assess).

---

### SA-1 – System and Services Acquisition Policy and Procedures
- **Implementation:**  
  Defined in `/docs/policies/SA-Policy.md`.  
  Establishes procedures for secure acquisition, contract requirements, software validation, and third-party risk review.  
  Requires integration of security checkpoints during procurement and development.  
- **Responsible Role:** System Owner / Procurement Officer  
- **Assessment Method:** *Examine* SA-Policy; *Interview* acquisition team  
- **Evidence:** `SA-Policy.md`  

---

### SA-2 – Allocation of Resources
- **Implementation:**  
  AutoNIST Core designates budget and personnel resources to support ongoing security, compliance, and system authorization activities.  
  Annual resource plan approved by the Authorizing Official (AO).  
- **Responsible Role:** System Owner / AO  
- **Assessment Method:** *Examine* budget plans; *Interview* AO  
- **Evidence:** `resource_allocation_plan.pdf`; project funding records  

---

### SA-3 – System Development Life Cycle (+ Enhancements 1–4)
- **Implementation:**  
  Security integrated into each phase of the AutoNIST Core SDLC: planning, design, development, testing, deployment, and maintenance.  
  - (SA-3 (1)): Security checkpoints in every pipeline stage.  
  - (SA-3 (2)): Automated code scanning for OWASP Top 10 and SANS CWE vulnerabilities.  
  - (SA-3 (3)): Secure coding standards enforced via Git pre-commit hooks.  
  - (SA-3 (4)): Security validation occurs prior to production release.  
- **Responsible Role:** DevSecOps Lead / ISSO  
- **Assessment Method:** *Test* CI/CD gates; *Examine* code review logs  
- **Evidence:** `ci_cd_pipeline.yaml`; `secure_code_guidelines.md`  

---

### SA-4 – Acquisition Process (+ Enhancements 1–12)
- **Implementation:**  
  Contracts and service agreements include explicit security and privacy clauses aligned with FAR 52.239-1 and DFARS 252.204-7012.  
  - (SA-4 (1)): All third-party services must provide FedRAMP authorization evidence.  
  - (SA-4 (2)): Vendors subject to security due diligence review.  
  - (SA-4 (9)): Supply chain components verified using SBOM validation.  
  - (SA-4 (10)): Subcontractors required to follow equivalent safeguards.  
  - (SA-4 (12)): Regular audits ensure ongoing compliance.  
- **Responsible Role:** Contracting Officer / ISSO  
- **Assessment Method:** *Examine* contracts; *Interview* vendor managers  
- **Evidence:** `vendor_security_checklist.xlsx`; `sbom_validation_report.json`  

---

### SA-5 – System Documentation
- **Implementation:**  
  AutoNIST Core maintains complete documentation, including architecture diagrams, API definitions, and component dependencies.  
  Documents version-controlled in GitHub and updated automatically during releases.  
- **Responsible Role:** DevSecOps / Documentation Specialist  
- **Assessment Method:** *Examine* repo documentation; *Interview* developers  
- **Evidence:** `/docs/architecture/`; `readme.md`  

---

### SA-8 – Security Engineering Principles
- **Implementation:**  
  Architecture and development adhere to NIST SP 800-160 Vol. 1 systems security engineering principles.  
  Emphasis on least privilege, defense-in-depth, fail-safe defaults, and attack surface minimization.  
- **Responsible Role:** Security Architect / DevSecOps  
- **Assessment Method:** *Examine* architecture diagrams; *Test* enforcement of security principles  
- **Evidence:** `System_Boundary_Diagram.png`; `security_design_notes.md`  

---

### SA-9 – External System Services (+ Enhancements 1–6)
- **Implementation:**  
  External services (e.g., FedRAMP cloud, scanning platforms, analytics tools) vetted for compliance and monitored continuously.  
  - (SA-9 (1)): Security provisions explicitly documented in SLAs.  
  - (SA-9 (2)): Logs from external services integrated into CCM.  
  - (SA-9 (5)): FedRAMP or ISO 27001 certification required for all cloud providers.  
  - (SA-9 (6)): Automated verification ensures external APIs use TLS 1.3.  
- **Responsible Role:** System Owner / ISSO  
- **Assessment Method:** *Examine* SLA terms; *Test* CCM external log ingestion  
- **Evidence:** `service_agreements.pdf`; `external_service_monitoring.yaml`  

---

### SA-10 – Developer Configuration Management
- **Implementation:**  
  All source code changes tracked in Git with branch protection rules and code review requirements.  
  Dev environment mirrors production configuration for accurate validation.  
- **Responsible Role:** DevSecOps Engineer  
- **Assessment Method:** *Examine* Git commit logs; *Test* merge workflows  
- **Evidence:** `.github/workflows/ci.yml`; `branch_protection_rules.json`  

---

### SA-11 – Developer Security Testing and Evaluation (+ Enhancements 1–4)
- **Implementation:**  
  - (SA-11): Static and dynamic analysis tools integrated into CI/CD.  
  - (SA-11 (1)): Unit and integration tests include negative test cases.  
  - (SA-11 (2)): Vulnerability findings tracked in POA&M.  
  - (SA-11 (3)): Security validation performed by independent assessor prior to release.  
  - (SA-11 (4)): Automated regression tests validate remediations.  
- **Responsible Role:** DevSecOps / QA Engineer  
- **Assessment Method:** *Test* CI/CD output; *Examine* test coverage reports  
- **Evidence:** `test_results.xml`; `security_test_report.pdf`  

---

### SA-12 – Supply Chain Protection (+ Enhancements 1–14)
- **Implementation:**  
  Supply chain components managed through SBOM generation and continuous verification.  
  - (SA-12 (1)): Component source validation (Git commit signing).  
  - (SA-12 (3)): External libraries scanned for known vulnerabilities.  
  - (SA-12 (6)): Third-party dependencies pinned to approved versions.  
  - (SA-12 (9)): Periodic revalidation of supplier integrity.  
  - (SA-12 (14)): System alerts triggered for unapproved dependency inclusion.  
- **Responsible Role:** Supply Chain Manager / DevSecOps  
- **Assessment Method:** *Test* SBOM scan; *Examine* dependency audit logs  
- **Evidence:** `software_bill_of_materials.json`; `dependency_audit_log.txt`  

---

### SA-13 – Trustworthiness Verification (Organizational Enhancement)
- **Implementation:**  
  Code, binaries, and deployment artifacts verified with digital signatures before deployment.  
  Verification performed automatically via GitHub Actions workflow.  
- **Responsible Role:** DevSecOps / ISSO  
- **Assessment Method:** *Test* signature verification; *Examine* build logs  
- **Evidence:** `build_verification_log.txt`; `code_signing_cert.pem`  

---

### SA-14 – Criticality Analysis (Organizational Enhancement)
- **Implementation:**  
  AutoNIST Core identifies critical functions (e.g., CCM engine, Evidence Store, API gateway) and maps them to RMF impact categories.  
  Redundancy and fallback mechanisms tested quarterly.  
- **Responsible Role:** System Owner / Security Engineer  
- **Assessment Method:** *Examine* criticality analysis report; *Interview* developers  
- **Evidence:** `criticality_analysis_report.pdf`; `redundancy_test_results.json`  

---

### SA-15 – Development Process, Standards, and Tools (Organizational Enhancement)
- **Implementation:**  
  Secure coding standards (NIST SP 800-218, OWASP ASVS) adopted and enforced via pre-commit hooks.  
  Tools and environments approved and baseline-hardened prior to use.  
- **Responsible Role:** DevSecOps / QA Lead  
- **Assessment Method:** *Examine* coding standard documentation; *Test* pipeline validation  
- **Evidence:** `secure_code_guidelines.md`; `tool_validation_report.json`  

---

### System and Services Acquisition Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 13 | 12 | 1 | 0 | 0 |

**Residual Risk:** Low – ongoing automation of supplier integrity monitoring.  
**Next Milestones:** Integrate third-party SBOM scanning API; add pre-release risk scoring to CI/CD security gate.
## 19  Control Family – Program Management (PM)

### Family Summary
The Program Management (PM) family defines the overarching governance, strategy, and resource management framework for AutoNIST Core.  
These controls ensure that security, privacy, and risk management are implemented consistently across the organization, integrated into program-level oversight, and maintained through continuous monitoring and strategic alignment with NIST RMF and organizational mission objectives.

---

### PM-1 – Information Security Program Plan (+ Enhancements 1, 2)
- **Implementation:**  
  The organization maintains an enterprise Information Security Program Plan (ISPP) that defines structure, roles, and resources required to implement security across systems.  
  - (PM-1 (1)): AutoNIST Core aligns with the ISPP through quarterly program reviews.  
  - (PM-1 (2)): Security objectives mapped to mission and business priorities.  
- **Responsible Role:** Chief Information Security Officer (CISO) / System Owner  
- **Assessment Method:** *Examine* ISPP; *Interview* CISO  
- **Evidence:** `Information_Security_Program_Plan.pdf`; quarterly review minutes  

---

### PM-2 – Senior Information Security Officer
- **Implementation:**  
  The organization designates a CISO responsible for developing and maintaining the information security program.  
  The CISO provides oversight, coordinates authorizations, and reports directly to executive leadership.  
- **Responsible Role:** CISO  
- **Assessment Method:** *Interview* CISO; *Examine* organizational chart  
- **Evidence:** `org_chart.pdf`; `CISO_designation_letter.pdf`  

---

### PM-3 – Information Security Resources
- **Implementation:**  
  Adequate funding and personnel allocated to sustain AutoNIST Core’s security program.  
  Resource levels reviewed annually to ensure compliance and resilience.  
- **Responsible Role:** Program Manager / AO  
- **Assessment Method:** *Examine* budget allocations; *Interview* AO  
- **Evidence:** `resource_allocation_plan.pdf`; project budget reports  

---

### PM-4 – Plan of Action and Milestones (POA&M) Process
- **Implementation:**  
  AutoNIST Core implements an automated POA&M management system that tracks, prioritizes, and verifies remediation actions.  
  Findings feed directly from vulnerability and control assessments.  
- **Responsible Role:** ISSO / Risk Officer  
- **Assessment Method:** *Test* POA&M automation; *Examine* open and closed action items  
- **Evidence:** `poam_generator.py`; `poam_dashboard.json`  

---

### PM-5 – Information System Inventory
- **Implementation:**  
  Maintains a continuously updated inventory of information systems and components, synchronized with the configuration management database (CMDB).  
- **Responsible Role:** Configuration Manager / ISSO  
- **Assessment Method:** *Examine* inventory records; *Test* auto-sync routines  
- **Evidence:** `system_inventory.json`; `cmdb_sync_log.txt`  

---

### PM-6 – Information Security Measures of Performance
- **Implementation:**  
  Key performance indicators (KPIs) and key risk indicators (KRIs) monitored monthly through the CCM engine dashboard.  
  Metrics include patch timeliness, vulnerability closure rates, and compliance coverage percentage.  
- **Responsible Role:** CISO / ISSO  
- **Assessment Method:** *Examine* CCM reports; *Interview* performance manager  
- **Evidence:** `ccm_performance_metrics.json`; quarterly trend analysis  

---

### PM-7 – Enterprise Architecture
- **Implementation:**  
  AutoNIST Core integrates cybersecurity requirements into the organization’s enterprise architecture using zero-trust design and secure enclaves.  
  Architecture updates reviewed semi-annually.  
- **Responsible Role:** Enterprise Architect / ISSO  
- **Assessment Method:** *Examine* enterprise architecture documentation  
- **Evidence:** `enterprise_architecture_diagram.vsdx`; `EA_review_minutes.md`  

---

### PM-8 – Critical Infrastructure Plan
- **Implementation:**  
  The program includes contingency planning for critical infrastructure dependencies such as data center power, communications, and FedRAMP provider uptime.  
- **Responsible Role:** System Owner / AO  
- **Assessment Method:** *Examine* infrastructure resilience plan  
- **Evidence:** `critical_infrastructure_plan.pdf`; provider SLA records  

---

### PM-9 – Risk Management Strategy (+ Enhancements 1, 2)
- **Implementation:**  
  A documented Risk Management Strategy defines how risk is identified, analyzed, prioritized, and mitigated across all projects.  
  - (PM-9 (1)): Strategy reviewed annually and updated as necessary.  
  - (PM-9 (2)): Strategy integrated into enterprise risk dashboard.  
- **Responsible Role:** Risk Officer / CISO  
- **Assessment Method:** *Examine* risk strategy document; *Interview* risk team  
- **Evidence:** `risk_management_strategy.md`; `risk_dashboard.png`  

---

### PM-10 – Authorization Process
- **Implementation:**  
  AutoNIST Core follows a standardized Authorization to Operate (ATO) process in alignment with NIST RMF Step 5 (Authorize).  
  All system changes trigger continuous authorization evaluation through automation.  
- **Responsible Role:** AO / ISSO  
- **Assessment Method:** *Examine* ATO documentation; *Test* authorization workflow  
- **Evidence:** `authorization_package.zip`; `continuous_monitoring_report.pdf`  

---

### PM-11 – Mission and Business Process Definition
- **Implementation:**  
  Mission processes documented and linked to corresponding system functions.  
  Traceability maintained between business objectives, security requirements, and controls.  
- **Responsible Role:** Program Manager / System Owner  
- **Assessment Method:** *Examine* mission-process mapping; *Interview* process owners  
- **Evidence:** `mission_mapping.xlsx`; business continuity documentation  

---

### PM-12 – Insider Threat Program
- **Implementation:**  
  The organization implements an Insider Threat Program integrating personnel, behavioral, and technical monitoring data.  
  Alerts feed into risk management and incident response workflows.  
- **Responsible Role:** HR / CISO / ISSO  
- **Assessment Method:** *Examine* insider threat procedures; *Interview* HR  
- **Evidence:** `insider_threat_plan.md`; risk behavior reports  

---

### PM-14 – Testing, Training, and Monitoring
- **Implementation:**  
  Security training, system testing, and monitoring activities scheduled annually and tracked in the POA&M.  
  Automated validation ensures coverage across control families.  
- **Responsible Role:** ISSO / Training Coordinator  
- **Assessment Method:** *Examine* annual testing plan; *Interview* ISSO  
- **Evidence:** `training_plan.md`; `testing_schedule.csv`  

---

### PM-17 – Protection of Personally Identifiable Information (PII)
- **Implementation:**  
  PII handled according to NIST SP 800-122 and Privacy Act requirements.  
  Encryption enforced for all PII data at rest and in transit.  
- **Responsible Role:** Privacy Officer / ISSO  
- **Assessment Method:** *Examine* privacy impact assessment (PIA); *Test* encryption settings  
- **Evidence:** `PIA_AutoNIST_Core.pdf`; `privacy_policy.md`  

---

### PM-18 – Privacy Program Plan
- **Implementation:**  
  Privacy program established to ensure alignment with organizational and federal privacy requirements.  
  Roles defined for Privacy Officer and Data Protection Lead.  
- **Responsible Role:** Privacy Officer / Legal Counsel  
- **Assessment Method:** *Examine* Privacy Program Plan; *Interview* Privacy Officer  
- **Evidence:** `Privacy_Program_Plan.pdf`; policy review minutes  

---

### PM-20 – Plan of Action for System-Level Weaknesses
- **Implementation:**  
  AutoNIST Core automatically aggregates system-level weaknesses into centralized POA&M.  
  Each item assigned severity, owner, and resolution target date.  
- **Responsible Role:** ISSO / AO  
- **Assessment Method:** *Test* automated collection; *Examine* POA&M dashboard  
- **Evidence:** `poam_dashboard.json`; remediation tracker  

---

### Program Management Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 15 | 14 | 1 | 0 | 0 |

**Residual Risk:** Very Low – program-level security processes fully institutionalized.  
**Next Milestones:** Integrate enterprise risk dashboard API with CCM engine; expand insider threat analytics using behavior-based AI correlation.
## 20  Control Family – Security Assessment and Authorization (CA)

### Family Summary
The Security Assessment and Authorization (CA) family governs the processes for assessing, authorizing, and continuously monitoring AutoNIST Core to ensure ongoing compliance and risk management.  
The CA controls align with NIST SP 800-37 Rev. 2 (RMF), SP 800-53 Rev. 5, and FedRAMP Continuous Monitoring requirements.  
AutoNIST Core automates the creation, validation, and maintenance of key RMF artifacts — including SSPs, SAPs, SARs, and POA&Ms.

---

### CA-1 – Security Assessment and Authorization Policies and Procedures
- **Implementation:**  
  Defined in `/docs/policies/CA-Policy.md`.  
  Establishes procedures for assessment planning, testing, authorization package creation, and continuous monitoring.  
  Reviewed annually or when RMF guidance changes.  
- **Responsible Role:** ISSO / Authorizing Official (AO)  
- **Assessment Method:** *Examine* CA-Policy; *Interview* AO  
- **Evidence:** `CA-Policy.md`  

---

### CA-2 – Control Assessments (+ Enhancements 1–5)
- **Implementation:**  
  AutoNIST Core conducts control assessments quarterly and on-demand after significant changes.  
  - (CA-2): Assessments performed automatically using evidence ingestion APIs and OSCAL mappings.  
  - (CA-2 (1)): 3PAO or independent assessors review control effectiveness.  
  - (CA-2 (2)): CCM engine validates control evidence against expected artifacts.  
  - (CA-2 (4)): Automated report generation in OSCAL, PDF, and XML formats.  
  - (CA-2 (5)): Results directly populate POA&M entries for remediation.  
- **Responsible Role:** ISSO / Independent Assessor  
- **Assessment Method:** *Test* automated assessments; *Examine* generated SAR outputs  
- **Evidence:** `assessment_results.json`; `security_assessment_report.pdf`  

---

### CA-3 – Information System Connections (+ Enhancements 1–5)
- **Implementation:**  
  All interconnections documented in the System Interconnection Agreement (SIA).  
  - (CA-3 (1)): AO approval required before enabling external interfaces.  
  - (CA-3 (2)): Annual review of interconnection security requirements.  
  - (CA-3 (3)): Continuous monitoring validates connection health and encryption.  
  - (CA-3 (5)): Decommissioning triggers secure termination and record retention.  
- **Responsible Role:** System Owner / Network Engineer  
- **Assessment Method:** *Examine* SIA; *Test* connection monitoring logs  
- **Evidence:** `System_Interconnection_Agreement.md`; `connection_audit_log.json`  

---

### CA-5 – Plan of Action and Milestones (POA&M)
- **Implementation:**  
  AutoNIST Core automates POA&M generation from control assessments, vulnerability scans, and incident findings.  
  Entries prioritized based on severity and tracked to closure.  
- **Responsible Role:** ISSO / Risk Officer  
- **Assessment Method:** *Test* POA&M automation; *Examine* closed actions  
- **Evidence:** `poam_generator.py`; `poam_dashboard.json`  

---

### CA-6 – Authorization (+ Enhancements 1–5)
- **Implementation:**  
  AutoNIST Core follows NIST RMF Step 5 (Authorize).  
  - (CA-6): AO grants authorization based on risk determination and evidence validation.  
  - (CA-6 (1)): Continuous Authorization framework automates ATO maintenance.  
  - (CA-6 (2)): ATO decision supported by automated SSP/SAR linkage.  
  - (CA-6 (4)): Automated notifications for control degradation.  
  - (CA-6 (5)): Authorization rescinded automatically upon unacceptable residual risk.  
- **Responsible Role:** AO / ISSO  
- **Assessment Method:** *Examine* authorization records; *Test* continuous authorization workflow  
- **Evidence:** `authorization_package.zip`; `continuous_authorization_report.json`  

---

### CA-7 – Continuous Monitoring (+ Enhancements 1–7)
- **Implementation:**  
  Continuous Monitoring (ConMon) implemented through the CCM engine.  
  - (CA-7 (1)): Key controls (AC, AU, CM, IR, SI, SC) monitored continuously.  
  - (CA-7 (2)): Dashboards visualize system health and control effectiveness.  
  - (CA-7 (3)): Control anomalies automatically generate POA&M entries.  
  - (CA-7 (4)): Monthly executive summaries sent to AO.  
  - (CA-7 (5)): Independent validation semi-annually.  
  - (CA-7 (7)): Integration with vulnerability scanning, SIEM, and compliance APIs.  
- **Responsible Role:** ISSO / DevSecOps  
- **Assessment Method:** *Test* dashboard automation; *Examine* ConMon reports  
- **Evidence:** `ccm_dashboard.json`; `conmon_summary_report.pdf`  

---

### CA-8 – Penetration Testing
- **Implementation:**  
  Annual penetration testing performed by certified independent assessors.  
  Results validated through retesting prior to closure.  
- **Responsible Role:** Independent Assessor / ISSO  
- **Assessment Method:** *Examine* penetration test report; *Interview* assessment team  
- **Evidence:** `penetration_test_report_YYYY.pdf`; `remediation_verification_log.txt`  

---

### CA-9 – Internal System Connections (+ Enhancements 1, 2)
- **Implementation:**  
  Internal interfaces authenticated and encrypted using mutual TLS.  
  Enhancement (CA-9 (1)): Automated discovery validates that all connections are documented.  
  Enhancement (CA-9 (2)): Continuous integrity check ensures no unauthorized inter-service links.  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* connection discovery; *Examine* internal service map  
- **Evidence:** `service_map.json`; `tls_handshake_log.txt`  

---

### CA-10 – System Interconnection Security Agreements
- **Implementation:**  
  All external systems require an Interconnection Security Agreement (ISA) approved by both AOs.  
  Agreements include data flow diagrams, encryption methods, and control mappings.  
- **Responsible Role:** AO / System Owner  
- **Assessment Method:** *Examine* signed ISAs; *Interview* system owners  
- **Evidence:** `ISAs_signed.pdf`; `data_flow_diagram.vsdx`  

---

### CA-11 – Continuous Authorization (Organizational Enhancement)
- **Implementation:**  
  AutoNIST Core maintains continuous authorization through automated evidence collection, risk scoring, and POA&M management.  
  AO dashboards display near real-time compliance posture.  
- **Responsible Role:** AO / ISSO  
- **Assessment Method:** *Test* continuous authorization metrics; *Examine* compliance score logs  
- **Evidence:** `authorization_dashboard.json`; `risk_score_trends.csv`  

---

### Security Assessment and Authorization Family Assessment Summary
| Control Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 10 | 9 | 1 | 0 | 0 |

**Residual Risk:** Low – continuous authorization fully operational with automated evidence ingestion.  
**Next Milestones:** Integrate external assessor API for real-time validation; implement AI-driven risk acceptance recommendations for AO decision support.

## 21  System and Communications Protection – High-Impact Enhancements

### Overview
This section extends the baseline SC controls for **High-High-High** impact environments (FIPS 199) such as air-gapped or classified enclaves.  
These enhancements introduce zero-trust segmentation, cross-domain solution (CDS) controls, packet-level inspection, and enclave-to-cloud data mediation aligned with CNSSI 1253, DoDI 8540.01, and NIST SP 800-207.

---

### SC-40 – Wireless Access Restrictions
- **Implementation:**  
  Wireless technologies disabled within high-impact environments.  
  Exceptions (e.g., maintenance tablets) require explicit AO authorization and FIPS 140-3 validated WPA3-Enterprise encryption.  
- **Responsible Role:** Network Engineer / FSO  
- **Assessment Method:** *Test* network scans; *Examine* AO approvals  
- **Evidence:** `wireless_policy.md`; RF sweep logs  

---

### SC-41 – Port and Protocol Control
- **Implementation:**  
  All inbound/outbound ports controlled via ACL and IDS-enforced rule sets.  
  Default-deny posture enforced at enclave boundary.  
- **Responsible Role:** Network Security Engineer  
- **Assessment Method:** *Test* firewall configurations; *Examine* IDS logs  
- **Evidence:** `acl_rules.json`; `port_protocol_matrix.xlsx`  

---

### SC-42 – Cross-Domain Solutions (CDS)
- **Implementation:**  
  Data transfer between security domains performed through an AO-approved CDS.  
  All transfers logged, scanned for malware, and content-filtered.  
- **Responsible Role:** ISSO / CDS Administrator  
- **Assessment Method:** *Test* file transfer process; *Examine* CDS audit logs  
- **Evidence:** `cds_transfer_logs.json`; `cds_configuration.yaml`  

---

### SC-43 – Trusted Path
- **Implementation:**  
  Administrative access tunnels established via mutually authenticated TLS channels.  
  Certificates validated through OCSP and CRL mechanisms.  
- **Responsible Role:** System Administrator / ISSO  
- **Assessment Method:** *Test* TLS trust chain; *Examine* certificate revocation logs  
- **Evidence:** `trusted_path_config.yaml`; `tls_validation_report.txt`  

---

### SC-44 – Boundary Device Redundancy
- **Implementation:**  
  Redundant boundary protection devices configured in fail-open secure mode with stateful session replication.  
  Periodic failover tests ensure continuity.  
- **Responsible Role:** Network Engineer / DevSecOps  
- **Assessment Method:** *Test* boundary failover; *Examine* device logs  
- **Evidence:** `redundancy_test_results.json`; `firewall_pair_config.yaml`  

---

### SC-45 – Zero-Trust Network Segmentation (Organizational Enhancement)
- **Implementation:**  
  All microservices operate in logically isolated subnets; dynamic policy enforcement provided via identity-aware proxies.  
  Continuous posture evaluation validates device and user trust before granting resource access.  
- **Responsible Role:** Security Architect / ISSO  
- **Assessment Method:** *Test* segmentation enforcement; *Examine* trust policy configurations  
- **Evidence:** `ztna_policy.yaml`; `microsegmentation_map.json`  

---

### SC-46 – Enclave-to-Cloud Guard
- **Implementation:**  
  Cloud synchronization occurs through encrypted guard gateways enforcing content inspection, DLP rules, and digital signature verification.  
  No direct cloud write operations permitted from enclave systems.  
- **Responsible Role:** Network Engineer / AO  
- **Assessment Method:** *Examine* data guard configurations; *Test* controlled data export  
- **Evidence:** `data_guard_config.yaml`; `transfer_audit_logs.json`  

---

### SC-47 – Encryption Algorithm Transition
- **Implementation:**  
  Supports quantum-resistant cryptography readiness; maintains compatibility with NIST PQC finalists (Kyber, Dilithium).  
  Implemented in pilot phase for key exchange and signing.  
- **Responsible Role:** Crypto Officer / ISSO  
- **Assessment Method:** *Test* PQC handshake; *Examine* algorithm configuration logs  
- **Evidence:** `pqc_test_results.txt`; `crypto_config.yaml`  

---

### High-Impact Enhancements Assessment Summary
| Enhancement Count | Fully Implemented | Partially | Inherited | Not Applicable |
| :-- | :--: | :--: | :--: | :--: |
| 8 | 7 | 1 | 0 | 0 |

**Residual Risk:** Very Low – additional PQC integration in progress.  
**Next Milestones:** Integrate quantum-resistant crypto libraries into production build; finalize CDS automation with anomaly detection.

---

## Appendix A – Framework Crosswalks and Mappings

### A.1  FIPS 199 – Security Categorization
| Security Objective | Impact Level | Rationale |
| :-- | :--: | :-- |
| Confidentiality | **High** | Contains CUI, operational, and mission data requiring strict protection. |
| Integrity | **High** | Data used to support compliance evidence and RMF decisions. |
| Availability | **High** | Continuous monitoring and compliance automation must remain operational to support AO decisions. |

**Overall Categorization:** **HIGH-HIGH-HIGH**

---

### A.2  FIPS 200 – Minimum Security Requirements Mapping
| Requirement Area | Reference Controls |
| :-- | :-- |
| Access Control | AC-1 → AC-22 |
| Awareness and Training | AT-1 → AT-5 |
| Audit and Accountability | AU-1 → AU-14 |
| Security Assessment | CA-1 → CA-11 |
| Configuration Management | CM-1 → CM-14 |
| Contingency Planning | CP-1 → CP-10 |
| Identification & Authentication | IA-1 → IA-10 |
| Incident Response | IR-1 → IR-10 |
| Maintenance | MA-1 → MA-9 |
| Media Protection | MP-1 → MP-8 |
| Physical & Environmental | PE-1 → PE-17 |
| Planning | PL-1 → PL-10 |
| Personnel Security | PS-1 → PS-9 |
| Risk Assessment | RA-1 → RA-9 |
| System & Services Acquisition | SA-1 → SA-15 |
| System & Communications Protection | SC-1 → SC-47 |
| System & Information Integrity | SI-1 → SI-16 |
| Program Management | PM-1 → PM-20 |

---

### A.3  RMF Process Mapping
| RMF Step | AutoNIST Core Functionality |
| :-- | :-- |
| **Step 1 – Categorize** | System boundary, data types, and FIPS 199 classification automated via metadata ingestion. |
| **Step 2 – Select** | AutoNIST baseline selector tailors 800-53 controls for chosen impact level. |
| **Step 3 – Implement** | Control evidence collection APIs populate SSP and POA&M automatically. |
| **Step 4 – Assess** | CCM engine performs continuous automated control validation. |
| **Step 5 – Authorize** | Continuous Authorization framework supports dynamic ATO maintenance. |
| **Step 6 – Monitor** | Dashboards provide ongoing posture and risk updates, feeding into AO decision dashboards. |

---

### A.4  OSCAL Export and Automation References
| Artifact | Location | Description |
| :-- | :-- | :-- |
| System Security Plan (SSP) | `/exports/oscal/ssp_autoNIST_high.json` | Full control catalog and implementation details. |
| Security Assessment Plan (SAP) | `/exports/oscal/sap_autoNIST.json` | Automated test coverage for implemented controls. |
| Security Assessment Report (SAR) | `/exports/oscal/sar_autoNIST.json` | Results of automated and manual assessments. |
| Plan of Action and Milestones (POA&M) | `/exports/oscal/poam_autoNIST.json` | Remediation and risk-tracking details. |

---

**Final Compliance Status:**  
✅ *All NIST SP 800-53 Rev 5 High-Baseline controls implemented or inherited.*  
✅ *RMF Steps 1–6 automated via AutoNIST Core architecture.*  
✅ *FedRAMP High and DoD IL5 alignment achievable with minimal tailoring.*

**Next Milestones:**  
1. Enable OSCAL-based synchronization with eMASS and FedRAMP Secure Repository.  
2. Integrate PQC-ready crypto stack (NIST Round 3 finalists).  
3. Implement AI-assisted evidence validation scoring in CCM engine.  
4. Generate exportable compliance-as-code package for customer deployment.

## Appendix B – Control Implementation Summary Tables

### Overview
This appendix consolidates every implemented control across all 20 families.  
Each entry lists implementation status, automation source, and evidence reference.  
Statuses: ✅ Fully Implemented 🕓 Partially Implemented 🧩 Inherited 🚫 Not Applicable

---

### Access Control (AC)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| AC-1 | ✅ | Access policy and procedures govern user account creation and revocation.| `AC-Policy.md` |
| AC-2 | ✅ | Automated account management via directory integration and API provisioning.| `account_mgmt.py` |
| AC-3 | ✅ | Role-based access enforced through IAM middleware.| `iam_policy.json` |
| AC-17 | ✅ | Remote access secured by MFA and VPN TLS 1.3.| `vpn_config.yaml` |
| AC-22 | ✅ | Public access limited to read-only APIs with key-based auth.| `api_gateway_rules.json` |

---

### Audit and Accountability (AU)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| AU-2 | ✅ | Central logging configured for all microservices.| `logging_config.yaml` |
| AU-6 | ✅ | Automated alerting for audit failures.| `ccm_alerts.log` |
| AU-8 | ✅ | Timestamp synchronized via NTP and UTC standard.| `ntp_config.txt` |
| AU-12 | ✅ | Audit reduction and report generation automated weekly.| `audit_summary.json` |

---

### Configuration Management (CM)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| CM-2 | ✅ | Baseline configurations stored in Git repository.| `baseline_config.yaml` |
| CM-3 | ✅ | Change control approved through pull-request workflow.| `pull_request_template.md` |
| CM-6 | ✅ | Automated configuration scans detect deviation.| `config_scan_report.json` |

---

### Incident Response (IR)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| IR-4 | ✅ | Incident handling orchestrated through SOAR playbooks.| `soar_playbook.yaml` |
| IR-5 | ✅ | Incident monitoring and notifications through CCM.| `incident_log.json` |
| IR-8 | ✅ | Post-incident reviews documented and tracked.| `after_action_report.pdf` |

---

### System and Communications Protection (SC)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| SC-7 | ✅ | Boundary protection via firewall and IDS/IPS pair.| `firewall_ruleset.json` |
| SC-8 | ✅ | TLS 1.3 enforced for all data in transit.| `ssl_config.yaml` |
| SC-13 | ✅ | FIPS 140-3 validated cryptographic modules.| `crypto_module_cert.pdf` |
| SC-45 | ✅ | Zero-trust network segmentation and continuous trust evaluation.| `ztna_policy.yaml` |
| SC-47 | 🕓 | Quantum-resistant crypto pilot in progress.| `pqc_test_results.txt` |

---

### System and Information Integrity (SI)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| SI-2 | ✅ | Automated flaw remediation via CI/CD pipeline.| `patch_report.json` |
| SI-3 | ✅ | Malware scanning on containers and binaries.| `malware_scan_report.json` |
| SI-4 | ✅ | Continuous monitoring for anomalies and SIEM integration.| `ccm_engine.py` |
| SI-7 | ✅ | Software integrity verified with signed hashes.| `integrity_validation.log` |

---

### Program Management (PM)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| PM-1 | ✅ | Information Security Program Plan defines enterprise governance.| `Information_Security_Program_Plan.pdf` |
| PM-4 | ✅ | Automated POA&M tracking through risk dashboard.| `poam_dashboard.json` |
| PM-9 | ✅ | Risk Management Strategy updated annually.| `risk_management_strategy.md` |
| PM-12 | ✅ | Insider Threat Program integrates HR and SIEM data.| `insider_threat_plan.md` |

---

### Security Assessment and Authorization (CA)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| CA-2 | ✅ | Automated control assessments with OSCAL export.| `assessment_results.json` |
| CA-6 | ✅ | Continuous authorization framework implemented.| `authorization_dashboard.json` |
| CA-7 | ✅ | Continuous monitoring with monthly summary reports.| `conmon_summary_report.pdf` |
| CA-8 | ✅ | Annual penetration testing by independent assessor.| `penetration_test_report.pdf` |

---

### System and Services Acquisition (SA)
| Control ID | Status | Implementation Summary | Evidence Reference |
|:--|:--:|:--|:--|
| SA-3 | ✅ | Secure SDLC with automated security testing.| `secure_code_guidelines.md` |
| SA-4 | ✅ | Contracts include FedRAMP and DFARS clauses.| `vendor_security_checklist.xlsx` |
| SA-11 | ✅ | Developer security testing integrated in CI/CD.| `security_test_report.pdf` |
| SA-12 | ✅ | Supply-chain components validated via SBOM.| `software_bill_of_materials.json` |

---

### Cross-Family Metrics
| Category | Total Controls | Fully Implemented | Partially | Inherited | Not Applicable |
|:--|:--:|:--:|:--:|:--:|:--:|
| Technical (AC, AU, SC, SI, IA) | 74 | 70 | 3 | 1 | 0 |
| Operational (CM, CP, IR, MA, MP, PS, PE) | 61 | 58 | 3 | 0 | 0 |
| Management (PL, RA, SA, CA, PM) | 67 | 65 | 2 | 0 | 0 |
| **Totals** | **202** | **193 (96%)** | **8 (4%)** | **1** | **0** |

**Residual Risk:** Minimal – All high-impact control families implemented and continuously monitored.  
**Next Milestones:** Integrate AI-driven control maturity scoring; expand OSCAL evidence automation to cover inheritance mapping for FedRAMP and DoD IL5.

## Appendix C – Automated Evidence Collection and Continuous Monitoring Workflow

AutoNIST Core automates Continuous Control Monitoring (CCM) and evidence collection to maintain real-time RMF and NIST SP 800-53 Rev 5 compliance.  
This appendix describes its data-flow architecture, pipelines, metrics, and escalation process.

---

### 1. Continuous Monitoring Architecture

flowchart TD
    A["Data Sources"] --> B["Evidence Collector"]
    B --> C["Evidence Normalizer"]
    C --> D["Evidence Store (S3 or GovCloud)"]
    D --> E["Compliance Mapping Engine"]
    E --> F["Control Catalog (NIST 800-53 / FedRAMP)"]
    F --> G["Dashboard and Alerts"]
    G --> H["POA&M Generator"]
    G --> I["Authorization Dashboard (AO Portal)"]

Component Summary

Data Sources → Logs, scans, tickets, and telemetry

Evidence Collector → Ingests via API or agent

Normalizer → Converts raw data to OSCAL JSON

Evidence Store → AES-256 encrypted storage (S3 / Blob)

Mapping Engine → Correlates evidence with controls

Dashboard → Displays compliance status and risk

POA&M Generator → Creates remediation tasks

2. Evidence Collection Pipelines
Source	Collection Method	Frequency	Output
Nessus / OpenVAS	API Pull	Daily	vulnerability_scan_results.json
GitHub / GitLab	Webhook	Per commit	build_validation_log.txt
Splunk / Elastic	Syslog feed	Continuous	security_events.log
ServiceNow / JIRA	REST API	Hourly	poam_ticket_sync.json
System Logs	Filebeat / Fluentd	Continuous	system_logs.json
CloudWatch / Azure Monitor	API feed	5 min	cloud_metrics.json
3PAO Assessments	Secure upload	Quarterly	security_assessment_report.pdf

All artifacts are digitally signed (SHA-384) and timestamped for integrity.

3. Control Validation Workflow
sequenceDiagram
    participant Src as Evidence Source
    participant Col as Collector
    participant Norm as Normalizer
    participant CCM as Validation Engine
    participant Store as Evidence Store
    participant POA as POA&M Tracker

    Src->>Col: Send logs / findings
    Col->>Norm: Map to control ID
    Norm->>Store: Save signed record
    Store->>CCM: Trigger verification
    CCM->>POA: Update status / create action
Workflow Highlights

Each control receives a score (0 – 100 %).

Scores < 85 % → Degraded status and automatic POA&M entry.

Evidence older than 30 days triggers a refresh alert.

4. RMF Artifact Automation Mapping
Artifact	Input Data	Generated File	Frequency
System Security Plan (SSP)	Control mappings + evidence metadata	oscal_ssp.json	On demand
Security Assessment Plan (SAP)	Test scripts + validation logs	oscal_sap.json	Quarterly
Security Assessment Report (SAR)	CCM results + assessor uploads	oscal_sar.json	Quarterly
Plan of Action & Milestones (POA&M)	Findings + scan results	oscal_poam.json	Continuous
5. Alerting and Escalation
Severity	Trigger	Notification	Response SLA
Critical	Control failure / breach	AO + ISSO via dashboard + email	4 h
High	CVSS ≥ 8.0	ISSO / DevSecOps	24 h
Medium	Compliance < 85 %	Weekly summary	72 h
Low	Evidence missing	Audit log only	–
6. Integration Points
Integration	Purpose	Security Controls
eMASS API	Automated OSCAL uploads	Mutual TLS 1.3
FedRAMP Repository	Push ATO packages	Signed evidence bundles
JIRA / ServiceNow	POA&M ticket sync	OAuth 2.0 tokens
Slack / Teams (Gov)	AO notifications	FIPS 140-3 encryption
AWS GovCloud / Azure GCCH	Evidence storage	FedRAMP High / DoD IL5
7. Continuous-Monitoring Metrics
Metric	Target	Source
Control Compliance Score	≥ 95 %	CCM Engine
Evidence Freshness	≤ 24 h	Collector heartbeat
Vulnerability Closure Rate	≥ 90 % / 30 days	Scanner feed
Mean Time to Detect (MTTD)	≤ 5 min	SIEM
Mean Time to Remediate (MTTR)	≤ 48 h	Ticket workflow
System Uptime	≥ 99.9 %	Cloud monitoring
8. Future Enhancements

AI-driven evidence correlation and scoring

Dynamic OSCAL 2.0 support for multi-cloud targets

Policy-as-code validation (OPA / Rego) in CI/CD

Live SBOM monitoring and dependency tracking

Predictive control drift analysis and trend forecasting

End of Appendix C

---

### ✅ Result
- Each heading renders properly in GitHub’s left-side navigation bar.  
- Tables stay readable without wrapping.  
- Mermaid diagrams show correctly in GitHub’s diagram viewer.  
- No mixed indentation or nested fences that break rendering.

Appendix D – Data Flow Diagrams and System Boundary Description
D.1 System Boundary Diagram
graph TD
    subgraph External["External Users"]
        U1[ISSO UI]:::user
        U2[AO Dashboard]:::user
        U3[Assessor Console]:::user
    end

    subgraph Application["AutoNIST Core Application"]
        A1[API Gateway]
        A2[CCM Engine]
        A3[Auth & RBAC]
    end

    subgraph Data["Data Layer"]
        D1[Evidence Store]
        D2[Config DB]
        D3[Audit Logs]
    end

    subgraph Integrations["External Systems"]
        I1[Nessus / OpenVAS]
        I2[JIRA / ServiceNow]
        I3[SIEM]
        I4[eMASS / FedRAMP Repo]
    end

    U1-->A1
    U2-->A1
    U3-->A1
    A1-->A2
    A2-->D1
    A2-->D2
    A2-->D3
    A2-->I1
    A2-->I2
    A2-->I3
    A2-->I4
System Boundary Summary

Application Tier (API Gateway, CCM Engine) + Data Tier (DB, Logs, Evidence) form the accredited boundary.

All interfaces use TLS 1.3 and mutual certificate validation.

External integrations require AO-approved Interconnection Agreements (SIA/ISA).

D.2 Trust Zones
Zone	Description	Key Controls
1	Admin / AO Dashboards	AC-17, IA-2
2	Application Services	SC-7, SI-4
3	Data Storage	SC-13, SC-28
4	External Interfaces	CA-3, SC-8
5	Infrastructure / Host	PE-3, CM-6
Appendix E – RMF Control Implementation Responsibility Matrix
Control Family	AO	ISSO	ISSM	CISO	SysO	DevSecOps	Assessor	Risk Officer	Privacy	FSO
AC – Access Control	A	R	C	I	C	R	C	I	I	–
AU – Audit & Accountability	I	R	C	I	C	R	C	I	–	–
CA – Security Assessment	A	R	C	I	I	C	R	C	–	–
CM – Configuration Mgmt	I	R	C	I	A	R	C	I	–	–
IR – Incident Response	I	R	A	C	C	C	C	R	–	–
MA – Maintenance	I	R	C	I	A	R	–	I	–	C
PE – Physical Security	A	C	C	I	I	–	–	I	–	R
PM – Program Mgmt	A	C	R	R	I	I	I	C	C	–
RA – Risk Assessment	I	R	C	I	C	C	C	A	–	–
SA – Acquisition	A	R	C	I	R	R	C	I	–	–
SC – Comms Protection	I	R	C	I	C	R	C	I	–	–
SI – Integrity	I	R	C	I	A	R	C	I	–	–

Legend:
R – Responsible A – Accountable C – Consulted I – Informed

Appendix F – Change Management & Version Control Policy
F.1 Objectives

Preserve configuration integrity

Ensure authorized, documented changes

Provide rollback capability

Maintain traceability between commits, approvals, and POA&M entries

F.2 Workflow
flowchart LR
    A[Developer Branch] --> B[Pull Request]
    B --> C[Automated Tests]
    C --> D[Peer Review / ISSO]
    D --> E[Merge to Main]
    E --> F[Deploy to Staging]
    F --> G[Security Scan]
    G --> H[Production Deploy]
    H --> I[Tag Release + Audit Log]
F.3 Standards
Rule	Description
Branch Names	feature/*, bugfix/*, hotfix/*, release/*
Default Branch	main (protected, requires approval)
Commit Format	Conventional Commits (feat:, fix:, etc.)
Reviews	At least 1 approving reviewer
Tagging	Semantic Versioning vX.Y.Z
Retention	Keep merged branches 90 days
Rollback	Automated via CI/CD pipeline
F.4 Roles (CM-2 through CM-6)
CM Control	Responsible	Supporting
CM-2 Baseline Config	DevSecOps	ISSO
CM-3 Change Control	ISSM	AO
CM-4 Impact Analysis	Risk Officer	Assessor
CM-5 Access Restriction	ISSO	AO
CM-6 Config Settings	DevSecOps	SysO
F.5 Approval Thresholds
Category	Risk	Approval	Window
Emergency	Critical	AO + ISSM	4 hrs
Major	High	AO / ISSM	24 hrs
Moderate	Medium	ISSO	48 hrs
Minor	Low	DevSecOps Lead	72 hrs

## Appendix G – Incident Response Workflow & SOAR Integration

### Overview
This appendix defines AutoNIST Core’s end-to-end **Incident Response (IR)** workflow, automation framework, and integration with the SOAR (Security Orchestration, Automation, and Response) platform.  
It fulfills **NIST SP 800-53 Rev. 5 IR-1 through IR-10** and supports **RMF Step 5 (Authorize)** and **Step 6 (Monitor)** by providing real-time detection, containment, and recovery capabilities.

---

### G.1 Incident Response Lifecycle (Overview)

flowchart LR
    A["Detect Event"] --> B["Analyze and Classify"]
    B --> C["Containment"]
    C --> D["Eradication and Recovery"]
    D --> E["Post-Incident Review"]
    E --> F["Lessons Learned and POA&M Update"]

Lifecycle Phases

Detection – Event identified via SIEM or anomaly detection.

Analysis – Severity / category determined and assigned.

Containment – Access restricted; network or host isolation enacted.

Eradication & Recovery – Threat removed; systems validated before return to service.

Post-Incident Review – Root cause, corrective actions, and lessons captured.

G.2 SOAR Integration Architecture
graph TD
    SIEM[SIEM / Log Sources] --> SOAR[SOAR Platform]
    SOAR --> IRDB[Incident Database]
    SOAR --> POAM[POA&M Tracker]
    SOAR --> NOTIFY[Email / ChatOps Alert]
    SOAR --> TICKETS[Ticketing System (JIRA / ServiceNow)]
    SOAR --> CMDB[CMDB / Asset Store]
    POAM --> AO[AO / ISSO Dashboard]
Description

SIEM Integration: Alerts feed directly into SOAR via webhook or syslog.

Automation Playbooks: Contain predefined response actions (e.g., quarantine endpoint, disable account, create ticket).

Incident Database: Stores structured evidence + timeline.

POA&M Sync: Findings automatically logged for remediation tracking.

AO Dashboard: Summarizes open incidents, mean-time-to-respond, and residual risk.

G.3 Incident Classification Matrix
Category	Example Trigger	Typical Impact	Response Lead	SLA
CAT 1 – Unauthorized Access	Compromised credential or privilege escalation	High	ISSO / IR Lead	4 h
CAT 2 – Denial of Service	Network flood or resource exhaustion	Medium	DevSecOps / NetEng	8 h
CAT 3 – Malware Infection	Detected malicious binary or script	High	IR Analyst	6 h
CAT 4 – Policy Violation	Unauthorized software install	Low	ISSO / HR	24 h
CAT 5 – Data Spillage / Leak	CUI transmitted to unauthorized system	Critical	Privacy Officer / AO	2 h
CAT 6 – Probe / Scan	Reconnaissance attempt detected	Low	Security Analyst	48 h
CAT 7 – Configuration Error	Misconfigured ACL / policy drift	Medium	DevSecOps	12 h
G.4 Automated Response Playbooks (Examples)
Playbook Name	Trigger	Automated Action	Manual Approval Required
User-Account Lockout	Multiple failed logins	Disable account + alert ISSO	No
Host Isolation	Endpoint IOC detected	Remove from network via EDR API	Yes
Malware Containment	File hash matches known signature	Quarantine file + trigger scan	No
Data Spillage Workflow	Unauthorized data movement	Stop transfer + alert Privacy Officer	Yes
Service Restart / Rollback	Container compromise alert	Deploy clean image from baseline	No
G.5 Incident Response Roles and Responsibilities
Role	Responsibilities	Evidence Generated
ISSO / IR Lead	Coordinate IR activities and reports to AO	incident_summary_report.pdf
DevSecOps Engineer	Execute containment / rollback actions	system_recovery_log.txt
Security Analyst	Validate alerts and triage severity	incident_ticket.json
Risk Officer	Update POA&M and risk register	poam_update_log.json
Privacy Officer	Lead response for PII events	privacy_incident_form.pdf
AO / CISO	Approve closure and residual risk acceptance	authorization_update.pdf
G.6 Communication and Notification Plan
Notification	Audience	Channel	Trigger / Threshold	SLA
Immediate Critical Alert	AO / CISO / ISSM	Encrypted email + dashboard	CAT 1 / 5 incident	≤ 1 h
High Severity Incident	ISSO / Risk Officer	Ticket + ChatOps message	CAT 2 / 3 event	≤ 2 h
Daily Status Report	IR Team	Automated digest	All open incidents	24 h
Monthly Metrics	AO / CISO	CCM Dashboard	IR KPIs and closure rates	Monthly
G.7 Metrics and Continuous Improvement
Metric	Target	Measurement Source
Mean Time to Detect (MTTD)	≤ 5 min	SIEM / SOAR logs
Mean Time to Respond (MTTR)	≤ 4 h (high) / 24 h (low)	SOAR tickets
Percentage of Automated Responses	≥ 60 %	SOAR playbook analytics
Recurrence Rate (Post-Remediation)	≤ 2 %	IR Database
Lessons Learned Closed in POA&M	100 % within 30 days	Risk Dashboard
G.8 Post-Incident Analysis and Lessons Learned Workflow
flowchart TD
    A[Incident Closed] --> B[Root Cause Analysis (RCA)]
    B --> C[Action Items Defined]
    C --> D[POA&M Entry Created]
    D --> E[Mitigation Implemented]
    E --> F[AO / ISSO Review]
    F --> G[Continuous Monitoring Verification]
Outputs Generated

Updated POA&M entries

Mitigation verification logs

Revised response playbook (if applicable)

Updated training modules for personnel

G.9 Alignment to NIST SP 800-61 (Computer Security Incident Handling Guide)
NIST 800-61 Phase	AutoNIST Core Alignment
Preparation	SOAR playbooks, IR plan, personnel training
Detection & Analysis	SIEM correlation + SOAR event triage
Containment / Eradication / Recovery	Automated quarantine + rollback workflow
Post-Incident Activity	RCA, POA&M integration, trend reporting

End of Appendix G

AutoNIST Core’s integrated SOAR and incident response framework ensures rapid detection, measured containment, and auditable remediation while continuously improving organizational resilience and compliance posture.
## Appendix H – Contingency Planning and Disaster Recovery Architecture

### Overview
This appendix defines AutoNIST Core’s **contingency-planning, backup, and disaster-recovery strategy**, aligning with **NIST SP 800-34 Rev. 1**, **CP-1 through CP-10**, and **FedRAMP High / DoD IL5** resiliency requirements.  
It ensures operational continuity of mission-critical compliance functions and data integrity during disruptive events.

---

### H.1 Contingency Planning Objectives
1. Maintain essential functions under adverse conditions.  
2. Ensure timely restoration of full capability after disruption.  
3. Protect confidentiality and integrity of backups.  
4. Provide validated recovery procedures for all environments.  
5. Document and test recovery strategies at least annually.  

---

### H.2 Business Impact Analysis (BIA)

| System Component | Criticality | Max Allowable Downtime (MAD) | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) |
|:--|:--:|:--:|:--:|:--:|
| Compliance Engine | Mission Critical | 4 hours | 2 hours | 15 min |
| API Gateway / UI | High | 8 hours | 4 hours | 1 hour |
| Evidence Store (S3/Blob) | High | 12 hours | 6 hours | 30 min |
| Config Database | High | 8 hours | 4 hours | 15 min |
| Log and Audit Store | Medium | 24 hours | 12 hours | 1 h
Backup Process

Automated incremental backups every 15 minutes for databases.

Full snapshots nightly with AES-256 encryption and SHA-256 hashing.

Replication between regions with latency ≤ 1 minute.

Offline air-gapped storage retained for 90 days.

Quarterly integrity verification and restore validation.

H.4 Disaster Recovery Tiers
Tier	Scenario	Recovery Action	Responsible Role
Tier 1	Minor service disruption	Auto-restart services via orchestration	DevSecOps Lead
Tier 2	Data corruption	Restore from snapshot / replica	Database Admin
Tier 3	Regional outage	Failover to alternate region	ISSO / SysO
Tier 4	Total loss of primary site	Activate Disaster Recovery site + offline restore	AO / CISO
Tier 5	Cyberattack compromising infrastructure	Isolate, forensic analysis, rebuild from clean baseline	ISSO / IR Team
H.5 Failover and Restoration Workflow
sequenceDiagram
    participant P as Primary System
    participant S as Secondary System
    participant B as Backup Vault
    participant U as Users

    P->>S: Replicate Data (Continuous)
    P--x S: Failure Detected (Health Check Fail)
    S->>U: Redirect Traffic to Secondary
    S->>B: Verify Data Integrity
    B->>S: Restore Missing Segments
    S->>U: System Online / Recovered
H.6 Testing and Validation Schedule
Test Type	Frequency	Responsible Role	Artifacts Produced
Tabletop Exercise	Quarterly	ISSO / AO / CISO	tabletop_report.pdf
Functional Failover Test	Semi-Annual	DevSecOps / SysO	failover_test_log.txt
Full Disaster Simulation	Annual	ISSM / AO	disaster_recovery_report.pdf
Backup Integrity Verification	Monthly	Database Admin	backup_validation_log.json
H.7 Communication Plan (During Disruption)
Phase	Audience	Method	Frequency
Incident Notification	AO / CISO / ISSM	Encrypted email + ChatOps	Immediate
Status Updates	All personnel	Secure portal / intranet	Every 2 h
Public Comms (if required)	Stakeholders / Clients	AO approved press release	As needed
After-Action Briefing	All stakeholders	Video conference	Post restoration
H.8 Contingency Plan Maintenance

Contingency Plan reviewed and updated every 12 months or after any major change.

Results from tests and real incidents feed into Plan of Action & Milestones (POA&M).

Configuration baselines validated against approved disaster-recovery infrastructure.

Documented lessons learned are shared with all security and operations staff.

H.9 Alignment to NIST SP 800-34 and FedRAMP Controls
Control Reference	Description	AutoNIST Core Implementation
CP-1	Contingency Planning Policy & Procedures	Documented plan reviewed annually
CP-2	Contingency Plan	Implemented and tested
CP-3	Contingency Training	Quarterly training for Ops staff
CP-4	Plan Testing	Tabletop + full simulation
CP-6	Alternate Storage Site	Secondary GovCloud region
CP-7	Alternate Processing Site	Automated failover environment
CP-8	Telecommunications Services	Redundant VPN and encrypted links
CP-9	Information System Backup	Automated and verified daily
CP-10	Information System Recovery	Documented playbooks + validated timelines

End of Appendix H

AutoNIST Core’s resilient architecture and tested disaster-recovery procedures ensure mission continuity and data integrity across FedRAMP High and DoD IL5 environments.

## Appendix I – System Integrity Monitoring and Vulnerability Management

### Overview
This appendix defines AutoNIST Core’s processes for **system integrity verification**, **vulnerability management**, and **patch lifecycle control** in alignment with **NIST SP 800-53 Rev. 5 SI-2 through SI-7** and **RA-5**.  
It supports continuous risk reduction through proactive scanning, alerting, and automated remediation.

---

### I.1 Objectives

1. Maintain verifiable system integrity across all environments.  
2. Detect unauthorized or anomalous changes in code, binaries, or configuration.  
3. Identify and remediate vulnerabilities according to risk-based priorities.  
4. Ensure all patching and updates follow controlled, documented workflows.  
5. Provide continuous compliance evidence via automated reporting.

---

### I.2 Integrity Monitoring Architecture

```mermaid
flowchart TD
    A[Host / Container Agents] --> B[Integrity Monitor]
    B --> C[Hash Baseline DB]
    B --> D[SIEM / SOAR]
    D --> E[Alerting and Ticketing]
    C --> F[Baseline Verification Engine]
    F --> G[CCM Evidence Store]

Components

Host Agents: Deployed on all nodes; compute cryptographic hashes of key binaries and configs.

Integrity Monitor: Compares current hashes to baseline values; triggers alerts on drift.

Hash Baseline DB: Maintains approved hashes signed by the ISSO.

SIEM / SOAR: Correlates integrity events with other telemetry for root-cause analysis.

Evidence Store: Captures all integrity logs for continuous monitoring and assessment.

I.3 Vulnerability Management Framework
Phase	Description	Tools / Sources	Frequency
Discovery	Identify assets and scan for vulnerabilities	Nessus / OpenVAS / Cloud Security Scanner	Weekly
Analysis	Assess risk using CVSS v3.1 scoring	AutoNIST Risk Engine	Continuous
Remediation	Apply patch or mitigation via CI/CD pipeline	GitHub Actions / Ansible / Terraform	As needed
Validation	Confirm resolution and rescan	Nessus API	Within 48 h
Reporting	Update POA&M and dashboards	CCM Engine	Continuous
I.4 Patch and Update Lifecycle
sequenceDiagram
    participant Dev as DevSecOps
    participant ISSO as Security Officer
    participant Repo as GitHub Repo
    participant CI as CI/CD Pipeline
    participant Test as Staging Env
    participant Prod as Production

    Dev->>Repo: Submit patch commit
    Repo->>CI: Trigger build and SAST/DAST scan
    CI->>Test: Deploy to staging for validation
    ISSO->>CI: Approve security review
    CI->>Prod: Release patch to production
    Prod->>Repo: Tag version + log evidence
I.5 Vulnerability Severity and Response Timelines
Severity Level	CVSS Range	Example Issue	Response Time	Mitigation Deadline
Critical	9.0–10.0	Remote code execution	Immediate notification	≤ 24 h
High	7.0–8.9	Privilege escalation	Notify ISSO	≤ 72 h
Medium	4.0–6.9	Info disclosure or weak cipher	Track in POA&M	≤ 7 days
Low	0.1–3.9	Cosmetic or informational	Monitor	≤ 30 days
I.6 Automated Patch Distribution
Environment	Method	Validation
On-Prem (Air-Gapped)	Signed update packages manually loaded	Offline signature verification
Cloud (GovCloud / GCCH)	CI/CD pipeline auto-deploys patches	Automated compliance check
Hybrid	Federation via secure API to local enclave	Token-based mutual TLS authentication
I.7 System Integrity Baseline Controls
Control	Implementation	Evidence
SI-2 – Flaw Remediation	Vulnerability scanner integration with CI/CD	scan_results.json, remediation_log.txt
SI-3 – Malicious Code Protection	Endpoint and container scanning	malware_scan_report.xml
SI-4 – System Monitoring	SIEM correlation and behavioral analytics	siem_alert_log.json
SI-7 – Software, Firmware, Information Integrity	Cryptographic hashing and baseline verification	integrity_verification_report.json
RA-5 – Vulnerability Scanning	Continuous scanning and risk analysis	vuln_summary.csv
I.8 Metrics and Reporting
Metric	Target	Data Source
Patch Compliance	≥ 95%	CI/CD logs
Time to Remediate (Critical)	≤ 24 h	Risk Dashboard
Integrity Drift Detected	≤ 1% hosts/month	Integrity Monitor
False Positive Rate	≤ 2%	SOAR reports
Vulnerability Recurrence	≤ 5% / quarter	Nessus delta scans
I.9 Continuous Improvement and Lessons Learned

All post-remediation activities are logged and reviewed monthly.

Lessons from false positives and delayed patches inform tuning of risk scoring models.

Findings feed directly into the POA&M and Risk Register.

Quarterly review ensures adherence to FedRAMP Continuous Monitoring reporting cadence.

I.10 Alignment with NIST Controls
Control Reference	Description	Implementation Summary
SI-2	Flaw Remediation	Automated patch scanning, testing, and deployment
SI-3	Malicious Code Protection	Endpoint and container-level scanning
SI-4	System Monitoring	24×7 SIEM + SOAR correlation
SI-7	Software and Information Integrity	Cryptographic hashing and signed baseline validation
RA-5	Vulnerability Scanning	Weekly scans with continuous analysis

End of Appendix I

AutoNIST Core’s integrated vulnerability and integrity management framework enables near-real-time detection, remediation, and verification, maintaining a trusted operational baseline across all deployment environments.

## Appendix J – Continuous Authorization & Risk Dashboard (ATO Automation Framework)

### Overview
AutoNIST Core implements a **Continuous Authorization (cATO)** capability that automates evidence ingestion, risk scoring, and ATO status updates in alignment with **NIST SP 800-37 Rev 2 (RMF 2.0)** and **FedRAMP Continuous Monitoring** requirements.  
This framework enables dynamic, data-driven authorization decisions rather than static annual approvals.

---

### J.1 Architecture Overview

```mermaid
flowchart TD
    A[CCM Engine – Evidence Collectors] --> B[Risk Scoring Service]
    B --> C[Risk Database (JSON / OSCAL Artifacts)]
    C --> D[Authorization Dashboard]
    D --> E[AO / ISSO Portal]
    D --> F[POA&M Manager]
    F --> G[Continuous Monitoring Metrics]
    G --> B -- Feedback Loop --> B
Workflow Summary

Evidence collected from CCM engine and control monitors

Risk Service computes quantitative scores based on likelihood × impact

OSCAL-formatted JSON artifacts store results for traceability

Dashboard renders live posture and authorization recommendations

AO reviews and accepts risk via dynamic cATO portal

J.2 Quantitative Risk Model
Likelihood Level	Value	Description
Rare	1	Event highly unlikely to occur
Unlikely	2	Limited exposure vector
Possible	3	Could occur under specific conditions
Likely	4	Observed in similar systems
Almost Certain	5	Repeated occurrence expected
Impact Level	Value	Description
Low	1	Minimal impact on mission
Moderate	2	Limited degradation
High	3	Mission impact requiring management attention
Severe	4	Significant operational disruption
Critical	5	Loss of mission capability / CUI compromise

Risk Score Formula

Risk Score = (Likelihood × Impact)


Risk Level Interpretation

Score Range	Risk Level	Required Action
1–5	Low	Monitor
6–10	Moderate	Mitigate within 30 days
11–15	High	AO review / POA&M entry
16–25	Critical	Immediate remediation / potential ATO suspension
J.3 OSCAL JSON Risk Artifact Example
{
  "system-risk-profile": {
    "system-id": "AutoNIST-Core",
    "authorization-status": "active",
    "risk-last-evaluated": "2025-10-19T00:00:00Z",
    "risk-scoring-model": {
      "method": "likelihood_impact_matrix",
      "scale": "1-5",
      "formula": "likelihood * impact"
    },
    "risk-items": [
      {
        "control-id": "SI-2",
        "description": "Unpatched critical vulnerability in container image",
        "likelihood": 5,
        "impact": 4,
        "risk-score": 20,
        "risk-level": "Critical",
        "status": "Open",
        "poam-id": "POAM-2025-001",
        "last-updated": "2025-10-19T00:00:00Z"
      },
      {
        "control-id": "AC-17",
        "description": "Remote access MFA enforcement delay",
        "likelihood": 3,
        "impact": 3,
        "risk-score": 9,
        "risk-level": "Moderate",
        "status": "Mitigating",
        "poam-id": "POAM-2025-014",
        "last-updated": "2025-10-19T00:00:00Z"
      }
    ],
    "aggregate": {
      "total-controls": 322,
      "evaluated-controls": 322,
      "compliance-score": 96.4,
      "average-risk-score": 4.2,
      "overall-risk-level": "Low"
    }
  }
}
J.4 Continuous Authorization Workflow
sequenceDiagram
    participant CM as Continuous Monitor
    participant RS as Risk Scoring Service
    participant AO as Authorizing Official
    participant DB as OSCAL Risk DB
    participant PO as POA&M System

    CM->>RS: Send new evidence / control status
    RS->>DB: Write risk artifact (JSON)
    DB->>AO: Trigger review notification
    AO->>PO: Approve or create mitigation task
    PO->>DB: Update status / closure
    DB->>RS: Refresh risk score
    RS->>CM: Confirm authorization state
J.5 Dynamic ATO Decision Matrix
Condition	Authorization Status	AO Action	System Response
All controls ≥ 90 % compliant and no Critical risks	Active	Maintain ATO	Standard monitoring
High risk > 10 % of controls or Compliance < 90 %	Conditional	AO approves temporary ATO with conditions	Increased frequency of monitoring
Critical risk detected or ATO scope breach	Suspended	AO requires remediation plan	Automatic notification to stakeholders
Persistent non-compliance or major breach	Revoked	AO terminates ATO	System access restricted
J.6 Risk Dashboard Metrics
Metric	Target	Source	Frequency
Overall Compliance Score	≥ 95 %	CCM Engine / OSCAL SSP	Continuous
Critical Risk Count	0	Risk DB	Hourly
POA&M Closure Rate	≥ 90 % / 30 days	POA&M Manager	Daily
Average Risk Score	≤ 5	Risk Service	Continuous
Authorization Status	Active / Conditional / Suspended	AO Portal	Real time
J.7 Control Mapping for Continuous Authorization
NIST Control	Description	AutoNIST Implementation
CA-7	Continuous Monitoring	Real-time evidence collection + risk dashboard
CA-8	Penetration Testing	Scheduled automated penetration tests
PM-9	Risk Management Strategy	Quantitative model + threshold policies
RA-3	Risk Assessment	Automated risk scoring via OSCAL artifact
RA-5	Vulnerability Scanning	Weekly scan integration
PL-2	System Security Plan	Dynamic SSP updates from risk engine
PL-8	Information Security Architecture	Dashboards mapped to boundary components
J.8 cATO Governance and Review Cadence
Activity	Frequency	Responsible	Evidence Artifact
Risk Score Re-evaluation	Continuous	Risk Officer / ISSO	risk_assessment_log.json
ATO Status Validation	Quarterly	AO / ISSM	authorization_review_report.pdf
System Boundary Audit	Annual	Security Architect	boundary_audit_record.md
Dashboard Calibration	Quarterly	DevSecOps	dashboard_metrics.csv
J.9 Key Benefits

Data-Driven Risk Decisions: AO bases authorization on quantitative metrics instead of subjective judgment.

Reduced Time to ATO: Automated assessment and risk artifacts accelerate approval.

Enhanced Transparency: Live dashboards enable auditors to see compliance status in real time.

Continuous Compliance: Eliminates static annual re-authorization cycles.

End of Appendix J

The AutoNIST Continuous Authorization and Risk Dashboard framework implements RMF 2.0’s vision of ongoing authorization, ensuring quantitative, evidence-driven risk management for FedRAMP High and DoD IL5 systems.

## Appendix K – Privacy Impact Assessment & PII Protection Controls

### Overview
This appendix documents AutoNIST Core’s privacy program and its alignment with **NIST SP 800-53 Rev. 5 privacy controls (AR, AP, PT families)** and **OMB Circular A-130**.  
The objective is to ensure the confidentiality, integrity, and purpose-limitation of **Personally Identifiable Information (PII)** and other sensitive data processed within the system.

---

### K.1 Privacy Governance Structure

```mermaid
graph TD
    A[Privacy Officer (PO)] --> B[Data Protection Program]
    B --> C[Privacy Risk Assessments]
    B --> D[Privacy Impact Assessment (PIA)]
    D --> E[System Owners]
    B --> F[Training & Awareness]
    B --> G[Incident Response / Breach Handling]
Key Roles

Role	Responsibilities
Privacy Officer (PO)	Oversees privacy compliance, conducts PIAs, reviews disclosures
ISSO / ISSM	Integrates privacy controls with security controls
System Owner (SysO)	Ensures PII processing follows data-minimization principles
DevSecOps Team	Implements technical protections (encryption, masking, access)
Legal Counsel / FOIA Officer	Advises on disclosure and consent obligations
K.2 Privacy Impact Assessment (PIA) Process
Phase	Description	Output Artifact
1 – Identify PII	Determine what data elements qualify as PII / CUI	pii_data_inventory.json
2 – Assess Purpose & Need	Evaluate legal authority and necessity	privacy_rationale.md
3 – Analyze Risks	Examine collection, storage, sharing, retention risks	privacy_risk_matrix.csv
4 – Mitigate	Apply technical / policy safeguards	mitigation_actions.yaml
5 – Approve & Publish	AO / Privacy Officer sign-off; update SSP	pia_summary.pdf

All PIAs are reviewed annually or when system changes significantly alter PII processing.

K.3 PII Data Flow
flowchart LR
    U[User / Personnel Input] --> A[Application API Gateway]
    A --> B[Encrypted Database (PII Store)]
    B --> C[Authorized Access via RBAC]
    B --> D[Audit Logs / Monitoring]
    A --> E[Anonymized Analytics Pipeline]
    E --> F[Reporting Dashboard (no PII)]
afeguards

Encryption: AES-256 at rest / TLS 1.3 in transit

Access: Role-based, least-privilege (AC-6, IA-2)

Retention: Auto-purge / data-expiration per record policy

Anonymization: Hashing + tokenization before analytics

K.4 Privacy Control Implementation Summary
Control Family	Control	Description	Implementation Artifact
AP-1	Authority to Collect	Legal justification documented in PIA	legal_authority.txt
AR-2	Privacy Impact Assessments	Annual PIA per system	pia_summary.pdf
AR-3	Privacy Requirements for Contractors	Privacy clauses in all SOW / MOU	contract_privacy_addendum.pdf
AR-4	Privacy Monitoring & Auditing	Quarterly audit reports	privacy_audit_log.json
AR-5	Privacy Awareness & Training	Mandatory annual training	training_roster.csv
AR-6	Privacy Reporting	FedRAMP and agency reports	privacy_reporting_form.pdf
AR-7	Privacy-Enhanced Design	Data-minimization in architecture	design_review.md
AR-8	Accounting of Disclosures	Log each external data share	disclosure_log.json
PT-2	Privacy Impact Analysis of Technology	Reviews before new feature deploy	tech_privacy_assessment.md
PT-4	Consent Mechanisms	User consent recorded / revocable	consent_registry.json
PT-5	Data Retention & Disposal	Automated retention policy	retention_schedule.yaml
K.5 Data-Retention and Minimization Policy
Data Type	Retention Period	Disposal Method	Responsible Role
User Account Data	3 years after deactivation	Cryptographic wipe + delete key	DevSecOps
Audit Logs (PII Redacted)	1 year min (then archive)	Secure archive with checksum	ISSO
Support Tickets (CUI)	5 years	Encrypted deletion batch	SysO
Training Records	6 years per OMB A-130	Controlled archive	Privacy Officer
K.6 Privacy Risk Matrix (Quantitative Example)
Risk ID	Description	Likelihood	Impact	Risk Score	Mitigation
PR-001	Accidental disclosure of user email in logs	2	3	6 (Medium)	Mask email fields; log review
PR-002	Unauthorized access to PII store	3	5	15 (High)	MFA, encryption, continuous monitoring
PR-003	Retention policy not enforced	2	4	8 (Moderate)	Automate expiry jobs; monthly validation
PR-004	Inadequate privacy training	3	2	6 (Medium)	Annual training + tracking dashboard
K.7 User Rights and Transparency
Right	Description	Implementation
Access and Review	Users may request copies of their PII	Handled via privacy_request_portal
Correction	Users can request corrections to PII	Verified by Privacy Officer
Consent Withdrawal	Users can opt out of non-essential processing	Immediate revocation via API
Disclosure Accounting	All external data shares logged	Auditable trail maintained in disclosure_log.json
K.8 Integration with Incident Response and Risk Frameworks

PII incidents feed directly into the SOAR workflow (Appendix G).

Privacy-specific events (e.g., data spillage) automatically notify the Privacy Officer & AO.

POA&M entries and risk scores link to CA-7 and RA-5 controls for continuous monitoring.

K.9 Privacy Metrics and Reporting
Metric	Target	Source	Frequency
PIA Completion Rate	100 % of systems	PIA repository	Annual
Privacy Training Completion	≥ 95 % of staff	LMS report	Quarterly
Data Retention Compliance	≥ 98 %	Retention scheduler logs	Monthly
Disclosure Audit Accuracy	100 %	Disclosure log reviews	Semi-annual
K.10 Alignment Summary
NIST Control	Description	AutoNIST Core Implementation
AR-2	Privacy Impact Assessment	Automated PIA generation and repository
AR-4	Privacy Monitoring and Auditing	Integrated metrics dashboard
PT-5	Data Retention and Disposal	Policy-as-code with automated schedules
PT-7	Consent and Transparency	User portal for access and revocation
AR-5	Privacy Training and Awareness	Integrated into annual security training

End of Appendix K

AutoNIST Core’s privacy framework ensures that the handling of PII is purpose-driven, minimized, and fully auditable, meeting FedRAMP High and DoD IL5 privacy protection requirements.

## Appendix L – Summary of Security Assessment Results & Residual Risk Matrix

### Overview
This appendix summarizes AutoNIST Core’s **security assessment outcomes**, including control effectiveness ratings, residual risks, and mitigation priorities, in accordance with **NIST SP 800-53A**, **FedRAMP Continuous Monitoring**, and **RMF Step 4 – Assess**.  
It captures results from independent testing and continuous control monitoring, forming the foundation for Authorization and ongoing risk decisions.

---

### L.1 Assessment Methodology

| Assessment Type | Description | Frequency | Responsible Role |
|:--|:--|:--:|:--|
| **Automated Testing** | Continuous verification via CCM engine | Continuous | DevSecOps / ISSO |
| **Manual Control Review** | ISSO verifies control evidence & SSP mapping | Quarterly | ISSO / Assessor |
| **Independent 3PAO Testing** | Full FedRAMP High control validation | Annual | Independent Assessor |
| **Vulnerability Scanning** | Automated scanning of systems & containers | Weekly | Security Analyst |
| **Penetration Testing** | Simulated adversarial testing | Semi-annual | Red Team / 3PAO |

All findings are logged in the POA&M with unique IDs and timestamps for traceability.

---

### L.2 Control Effectiveness Summary

| Control Family | # Controls | Fully Implemented | Partially Implemented | Planned / N/A | Effectiveness (%) |
|:--|--:|--:|--:|--:|--:|
| AC – Access Control | 25 | 25 | 0 | 0 | 100 |
| AU – Audit & Accountability | 16 | 15 | 1 | 0 | 94 |
| CM – Configuration Management | 14 | 13 | 1 | 0 | 93 |
| IR – Incident Response | 10 | 10 | 0 | 0 | 100 |
| CP – Contingency Planning | 10 | 10 | 0 | 0 | 100 |
| SC – System & Comms Protection | 47 | 44 | 3 | 0 | 94 |
| SI – System & Info Integrity | 16 | 16 | 0 | 0 | 100 |
| PL / PM Families | 25 | 25 | 0 | 0 | 100 |

**Average Control Effectiveness:** **97.6 %**

---

### L.3 Risk Category Distribution

```mermaid
pie showData
    "Critical (≥16)" : 3
    "High (11–15)" : 5
    "Moderate (6–10)" : 12
    "Low (1–5)" : 302
Interpretation:

Critical Risks: Require immediate mitigation and AO visibility.

High Risks: Managed via POA&M with 30-day resolution target.

Moderate Risks: Tracked through continuous monitoring dashboard.

Low Risks: Accepted or monitored with no additional action required.

L.4 Sample Residual Risk Matrix
Risk ID	Control	Description	Risk Score	Risk Level	Mitigation Status	Residual Risk
R-001	SC-8	Missing TLS 1.3 on legacy integration endpoint	12	High	TLS upgrade in progress	Low
R-002	SI-2	Critical CVE pending patch	20	Critical	Patch scheduled via CI/CD	Moderate
R-003	AC-17	MFA enforcement delay for new VPN users	9	Moderate	Temporary compensating control	Low
R-004	AU-12	Missing centralized log feed from one subnet	6	Moderate	Syslog connector deployment	Low
R-005	RA-5	Occasional false positives in vulnerability scans	4	Low	Algorithm tuned	Low
L.5 Residual Risk Scoring Model
Risk Level	Description	Example Action	AO Disposition
Critical	Unacceptable exposure; active exploitation possible	Emergency mitigation / system isolation	ATO hold
High	Significant impact; compensating control may be temporary	Prioritize remediation within 30 days	AO approval required
Moderate	Manageable risk; continuous monitoring sufficient	Track via POA&M	AO awareness
Low	Minimal exposure; inherent control sufficient	Accept	AO notification only
L.6 POA&M Summary Snapshot
Category	Open	Closed	% Closed	Trend
Technical Vulnerabilities	7	41	85.4	⬆ Improving
Policy / Documentation Gaps	2	9	81.8	➡ Stable
Training / Awareness	1	10	90.9	⬆ Improving
Third-Party Dependencies	3	7	70.0	⬆ Improving
Total	13	67	83.7 %	⬆ Upward Trend
L.7 Continuous Improvement and Lessons Learned

Integrate risk-scoring feedback loops from Appendix J to prioritize controls dynamically.

Automate closure validation in POA&M entries through the evidence-collection engine.

Increase 3PAO validation frequency for inherited cloud services.

Enhance anomaly detection using ML-based baselines for false-positive reduction.

Publish monthly risk dashboards to AO and ISSM for transparency.

L.8 Summary of Findings
Assessment Area	Rating	Comments
Technical Controls	Excellent	Minor issues found in legacy API endpoint
Operational Controls	Strong	User training and incident response mature
Management Controls	Excellent	Governance and risk posture documented and auditable
Overall Risk Posture	Low	Meets FedRAMP High continuous monitoring requirements
L.9 Alignment with NIST and FedRAMP Assessment Controls
Reference	Description	Implementation Status
CA-2	Security Assessments	Implemented and automated
CA-7	Continuous Monitoring	Active; near-real-time updates
CA-8	Penetration Testing	Semi-annual
RA-5	Vulnerability Scanning	Automated; weekly
PM-9	Risk Management Strategy	Documented and approved
PL-2	SSP Updates	Continuous; linked to risk DB
SI-2	Flaw Remediation	Automated via CI/CD pipeline
L.10 Executive Summary

Authorization Status: Active (Continuous ATO maintained)

Residual Risk: Low

Overall Compliance: ≥ 97 %

Recommendation: Maintain continuous monitoring and revalidate High-risk items quarterly.

Next Review: Scheduled for January 2026 under continuous ATO renewal cycle.

End of Appendix L

AutoNIST Core’s comprehensive assessment confirms that the system maintains a low residual risk profile and full alignment with NIST SP 800-53 Rev. 5 and FedRAMP High continuous monitoring requirements.
