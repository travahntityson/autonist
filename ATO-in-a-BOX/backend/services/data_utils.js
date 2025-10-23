// data_utils.js - Backend Data and Utilities

// --- MOCK TEST DATA (Required for Deterministic Services) ---

const MOCK_POLICY_CONTENT = `
    Section 3.1: Access Control. The organization mandates annual security training for all personnel (AT-2) and uses LMS records to verify completion. 
    Access enforcement is handled by implementing a Zero Trust Architecture (AC-3) across the network boundary. 
    Furthermore, the least privilege principle (AC-6) is strictly followed via a mandatory quarterly review of user permissions.
    Section 5.2: Media Protection. All magnetic media is destroyed or wiped according to NSS Manual 4009 (MP-6) standards by the facilities manager.
    The overall Continuous Monitoring program (CA-7) uses automated tools to check for configuration baseline enforcement (CM-6) every 12 hours.
    The formal Supply Chain Risk Management (SA-12) plan requires vetting for all COTS components before acquisition.
`;

const MOCK_DATA_MAPPING = Object.freeze({
  CCI_FINDINGS: [
    { cci: 'CCI-000200', controlId: 'AC-3', status: 'Pass', artifact: 'NIST STIG Report' },
    { cci: 'CCI-000343', controlId: 'IR-5', status: 'Fail', artifact: 'ACAS Scan Report' },
    { cci: 'CCI-000180', controlId: 'SI-10', status: 'Pass', artifact: 'SAST Tool Report' },
  ],
  NLP_KEYWORDS: {
    'AC-3': { keywords: ['zero trust architecture', 'access enforcement'], procedure: null, updatedBy: null },
    'AC-6': { keywords: ['least privilege principle', 'periodic review of user permissions'], procedure: null, updatedBy: null },
    'CM-6': { keywords: ['configuration baseline enforcement', 'automated tools to check for drift'], procedure: null, updatedBy: null },
    'AT-2': { keywords: ['annual security training', 'lms records'], procedure: null, updatedBy: null },
    'MP-6': { keywords: ['media is destroyed or wiped', 'nss manual 4009'], procedure: null, updatedBy: null },
    'SA-12': { keywords: ['supply chain risk management', 'vetting for all cots components'], procedure: null, updatedBy: null },
    'CA-7': { keywords: ['continuous monitoring program', 'iscm strategy'], procedure: null, updatedBy: null },
    'IR-5': { keywords: [], procedure: null, updatedBy: null },
    'SI-10': { keywords: [], procedure: null, updatedBy: null },
  },
});

// --- UTILITIES (Deterministic Randomness) ---

let seed = 12345;
const seededRandom = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};
const DETERMINISTIC_THRESHOLD = 0.8;

// --- SHARED CONSTANTS (New) ---

// Moved from App.jsx to be used by backend services
const STATUS_HIERARCHY = Object.freeze({
  Implemented: 3,
  'Partially Implemented': 2,
  'Not Implemented': 1,
  'Not Applicable': 0,
});

// --- EXPORTS ---
module.exports = {
  MOCK_POLICY_CONTENT,
  MOCK_DATA_MAPPING,
  seededRandom,
  DETERMINISTIC_THRESHOLD,
  STATUS_HIERARCHY,
};