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
