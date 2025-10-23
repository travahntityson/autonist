// src/components/Shared/Utils.js
import { API_BASE_URL } from '../../Constants';

// Function for client-side digest (used for export logging)
export const mockSha256Digest = (data) => {
    const hash = btoa(data).slice(0, 16);
    return `sha256:${hash}`;
};

/**
 * Utility function to POST a new audit log entry to the persistent database.
 * @param {string} sessionId - The UUID for the current user session.
 * @param {string} username - The current user's name (e.g., "ISSM / Auditor").
 * @param {string} role - The current user's role (e.g., "ISSM").
 * @param {string} action - The programmatic action key (e.g., "POA_M_GEN").
 * @param {string} detail - The human-readable detail string.
 * @param {string} [origin="UI"] - The origin of the event (UI or Backend).
 */
export const addAuditEvent = async (sessionId, username, role, action, detail, origin = 'UI') => {
    const newLogEntry = {
        sessionId,
        origin,
        username: `${role === 'System' ? username : username + ': Manual Action'}`,
        role: role,
        action,
        detail,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLogEntry),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('Failed to write audit log:', err.message || response.statusText);
        }
        
        // Return the log entry so the UI can optionally add it to its local state
        return newLogEntry;

    } catch (error) {
        console.error('Network error writing audit log:', error);
        return null; // Don't crash the app if logging fails
    }
};