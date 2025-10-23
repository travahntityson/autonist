// src/hooks/use_Api_Client.js
import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../Constants';

// Custom hook to handle API calls with loading/error state
// NOTE: Removed setAuditLog. Auditing is now handled by the calling function.
export const useApiClient = (setMessage) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const callApi = useCallback(async (endpoint, options = {}, successMessage) => {
        setIsProcessing(true);
        setMessage({ type: 'info', text: options.method === 'GET' ? 'Fetching data...' : 'Processing request...' });

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: `Server error: ${response.status} ${response.statusText}` }));
                throw new Error(err.message || `Server responded with ${response.status}`);
            }

            const result = await response.json().catch(() => ({})); // Handle no content (204)
            
            setIsProcessing(false);
            if (successMessage) {
                setMessage({ type: 'success', text: successMessage });
            }

            return result;

        } catch (e) {
            setIsProcessing(false);
            setMessage({ type: 'error', text: `API Error: ${e.message}` });
            console.error("API Call Failed:", e);
            return null;
        }
    }, [setMessage]); // <-- Dependency array updated

    return { callApi, isProcessing };
};