====================================================================
NIST SP 800-53 Rev 5.1.1 — Compliance Control Directory (v1.0)
====================================================================

This package contains a structured, machine-readable directory of all 
NIST SP 800-53 Rev 5.1.1 controls (including enhancements) based on 
the official NIST OSCAL JSON catalog. It is designed for automated 
Risk Management Framework (RMF) compliance and continuous monitoring.

--------------------------------------------------------------------
I.  SOURCE INFORMATION
--------------------------------------------------------------------
  • Source Catalog:   NIST SP 800-53 Rev 5.1.1 (OSCAL v1.1.2)
  • Provenance:       NIST Joint Task Force Interagency Working Group
  • Catalog UUIDs:    Preserved in all records
  • Generation Date:  2025-10-21
  • Build Version:    1.0
  • Build System:     Automated RMF Compliance Data Transformer

--------------------------------------------------------------------
II.  PACKAGE CONTENTS
--------------------------------------------------------------------
ROOT DIRECTORY
  ├── AC/ ... PT/                      → 20 control families (Access Control → Program Management)
  │    ├── <FAMILY>_full_pretty.json   → Human-readable family dataset
  │    ├── <FAMILY>_full_min.json      → Minified family dataset
  │    ├── <FAMILY>_index.json         → Control ID → array index map
  │    └── <FAMILY>_summary.json       → Family control and objective counts
  │
  ├── nist_800_53_rev5_full_pretty.json → Entire control catalog (pretty-printed)
  ├── nist_800_53_rev5_full_min.json    → Entire control catalog (minified)
  ├── nist_800_53_index_pretty.json     → Global control index
  ├── nist_800_53_index_min.json        → Compact global index
  ├── nist_800_53_summary_pretty.json   → Family-level statistics (readable)
  ├── nist_800_53_summary_min.json      → Family-level statistics (minified)
  │
  ├── schema_reference.json             → Field definitions and metadata schema
  ├── hash_manifest.json                → SHA-256 checksums for all files
  ├── hash_manifest.xml                 → DoD STIG/XCCDF-compatible checksum manifest
  ├── build_log.txt                     → Build-time actions and status messages
  └── README.txt                        → This document

--------------------------------------------------------------------
III.  DATA STRUCTURE OVERVIEW
--------------------------------------------------------------------
Each control object includes:
  {
    "id": "AC-2",
    "uuid": "<unique-uuid>",
    "family": "AC",
    "title": "Account Management",
    "type": "Base",
    "parent_id": null,
    "guidance": "...",
    "assessment_objectives_text": [ "Objective A...", "Objective B..." ],
    "assessment_objectives_tree": [
      { "label": "AC-2a.[01]", "text": "..." },
      { "label": "AC-2b.", "text": "..." }
    ],
    "assessment_methods": [
      { "method": "EXAMINE", "details": "..." },
      { "method": "INTERVIEW", "details": "..." },
      { "method": "TEST", "details": "..." }
    ],
    "_meta": {
      "build_version": "1.0",
      "build_date": "2025-10-21",
      "source_catalog": "NIST SP 800-53 Rev 5.1.1 (OSCAL v1.1.2)",
      "integrity_hash": "sha256:<file-specific-hash>",
      "signature": null,
      "signing_authority": null,
      "signature_algorithm": null
    }
  }

--------------------------------------------------------------------
IV.  INTEGRITY & VALIDATION
--------------------------------------------------------------------
  • All files hashed with SHA-256 (see hash_manifest.json and hash_manifest.xml).
  • Hash manifests include placeholders for digital signatures and signing authorities.
  • `_meta` blocks inside each file provide file-level integrity verification data.
  • Optional PKI signing can be applied via DoD or agency CA.

--------------------------------------------------------------------
V.  EXECUTION (LOCAL BUILD)
--------------------------------------------------------------------
Use the included build scripts to regenerate or verify this bundle:

  Node.js:
    node build_nist_800_53_bundle.js --input NIST_SP-800-53_rev5_catalog.json --output ./nist_bundle/

  Python 3:
    python build_nist_800_53_bundle.py --input NIST_SP-800-53_rev5_catalog.json --output ./nist_bundle/

Logs will be written to: build_log.txt

--------------------------------------------------------------------
VI.  VERSION CONTROL
--------------------------------------------------------------------
  • Version:       1.0 (Initial Baseline)
  • Release Date:  2025-10-21
  • Change Log:    Not included in this baseline

Future updates (v1.1, v2.0, etc.) should include new hashes and maintain backward compatibility.

--------------------------------------------------------------------
VII.  USAGE RIGHTS
--------------------------------------------------------------------
This dataset is derived from publicly available NIST publications and
is unclassified. It may be freely distributed, reused, and integrated
into RMF, FedRAMP, or CMMC automation platforms, subject to the terms
of NIST’s public domain notice.

--------------------------------------------------------------------
END OF DOCUMENT
====================================================================
