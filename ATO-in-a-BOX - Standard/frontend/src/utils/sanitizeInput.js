// src/utils/sanitizeInput.js

/**
 * Sanitizes input strings to prevent XSS attacks by using the DOM to strip
 * out potentially malicious HTML/scripts.
 * * NOTE: For production-grade security, a dedicated library like 'dompurify' is recommended.
 * * @param {string} rawString The raw text input, potentially containing HTML.
 * @returns {string} The sanitized text.
 */
export const sanitizeInput = (rawString) => {
    if (!rawString) return '';
    
    // 1. Create a temporary element (div) to hold the string.
    const tempDiv = document.createElement('div');
    
    // 2. Set the textContent. This automatically escapes any raw HTML tags 
    //    (e.g., `<script>` becomes `&lt;script&gt;`). This is the core security step.
    tempDiv.textContent = rawString;
    
    // 3. Read back the escaped string.
    return tempDiv.innerHTML;
};

// Optionally, if you are only rendering text and want to remove ALL HTML, 
// you can use the following approach as well:
export const stripHtml = (rawString) => {
    if (!rawString) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawString; // Use innerHTML to parse
    return tempDiv.textContent || tempDiv.innerText || rawString; // Return only the clean text
}