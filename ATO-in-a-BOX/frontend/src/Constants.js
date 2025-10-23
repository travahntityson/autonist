// Constants.js
import { CONTROL_FAMILIES_CODES } from './nist_control_data.js';

// Read the API_BASE_URL from Vite's environment variables
// It falls back to localhost:3001 if the .env.local file is missing
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const ROLES = Object.freeze({ // Frozen for immutability
  AO: { name: 'Authorization Official', color: 'bg-red-500/20 text-red-600 border-red-500', permissions: ['view_all', 'authorize'] },
  ISSM: { name: 'ISSM / Auditor', color: 'bg-blue-500/20 text-blue-600 border-blue-500', permissions: ['view_all', 'edit_controls', 'approve_poam', 'update_evidence'] },
  SO: { name: 'System Owner', color: 'bg-green-500/20 text-green-600 border-green-500', permissions: ['view_controls', 'update_evidence'] },
});

export const CONTROL_FAMILIES = {
    'AC': 'Access Control', 'AT': 'Awareness and Training', 'AU': 'Audit and Accountability',
    'CA': 'Security Assessment and Authorization', 'CM': 'Configuration Management', 'CP': 'Contingency Planning',
    'IA': 'Identification and Authentication', 'IR': 'Incident Response', 'MA': 'Maintenance',
    'MP': 'Media Protection', 'PE': 'Physical and Environmental Protection', 'PM': 'Program Management',
    'PS': 'Personnel Security', 'RA': 'Risk Assessment', 'SC': 'System and Communications Protection', 
    'SI': 'System and Information Integrity', 'SA': 'System and Services Acquisition', 'SR': 'Supply Chain Risk Management',
    'PL': 'Planning', 'PT': 'Privacy'
};

export const CONTROL_FAMILY_CODES = CONTROL_FAMILIES_CODES; 

export const CONTROL_STATUSES = ['Implemented', 'Partially Implemented', 'Not Implemented', 'Not Applicable'];

export const STATUS_HIERARCHY = Object.freeze({
    'Implemented': 3,
    'Partially Implemented': 2,
    'Not Implemented': 1,
    'Not Applicable': 0,
});