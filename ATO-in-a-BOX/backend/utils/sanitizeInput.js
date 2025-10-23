// src/utils/sanitizeInput.js

// FIXED: Replace insecure, manual DOM-based sanitization with a production-grade library
// NOTE: For full FedRAMP compliance, this library (e.g., dompurify) must be included
// in the project's Supply Chain Risk Management (SCRM) plan (SR-4).
// Assuming 'DOMPurify' is installed (e.g., npm install dompurify) and imported.
import DOMPurify from 'dompurify';

/**
 * Sanitizes input strings to prevent XSS attacks by filtering malicious HTML/scripts.
 * This function is mandatory for all user-generated content destined for display 
 * (e.g., control narratives, POA&M comments).
 * @param {string} rawString The raw text input, potentially containing HTML.
 * @returns {string} The sanitized text.
 */
export const sanitizeInput = (rawString) => {
    if (!rawString) return '';
    
    // CRITICAL SECURITY STEP: Use DOMPurify to sanitize the HTML content.
    // DOMPurify is highly trusted and avoids common bypasses associated with manual sanitization.
    // It processes the string and only returns allowed, safe HTML.
    return DOMPurify.sanitize(rawString);
};


/**
 * Strips all HTML from a string, returning only plain text. 
 * This is useful for inputs like search bars or simple text fields.
 * NOTE: We keep the stripHtml function for backward compatibility, but ensure it uses the browser's 
 * textContent property securely, or just use DOMPurify in a configuration that strips all HTML.
 */
export const stripHtml = (rawString) => {
    if (!rawString) return '';
    // Use DOMPurify configured to return plain text (by disallowing all tags)
    // This is generally safer than relying on innerHTML/textContent juggling.
    return DOMPurify.sanitize(rawString, { ALLOWED_TAGS: [] }); 
}

// Optionally, export the underlying DOMPurify instance if specific configurations are needed elsewhere
// export default DOMPurify;