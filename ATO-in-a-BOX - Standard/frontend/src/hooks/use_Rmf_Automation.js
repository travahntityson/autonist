// src/hooks/use_Rmf_Automation.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApiClient } from './use_Api_Client';
import { addAuditEvent } from '../components/Shared/Utils'; // <-- This is now the ASYNC version
import { API_BASE_URL } from '../Constants'; 

// Helper to add to local state AND POST to the API
// We wrap the utility function to also update our local state
const usePersistentAuditLog = (sessionId, currentRoleConfig) => {
    const [auditLog, setAuditLog] = useState([]);

    const logEvent = useCallback(async (action, detail, origin = 'UI') => {
        const username = currentRoleConfig.name;
        const role = origin === 'System' ? 'System' : currentRoleConfig.name;

        // 1. Post to DB (and get the formatted entry back)
        const newLogEntry = await addAuditEvent(sessionId, username, role, action, detail, origin);
        
        // 2. Update local state
        if (newLogEntry) {
            // We use the DB-formatted timestamp (from the server) or local if not
            setAuditLog(prevLog => [
                {...newLogEntry, timestamp: new Date().toISOString(), eventId: window.crypto.randomUUID()}, 
                ...prevLog
            ]);
        }
    }, [sessionId, currentRoleConfig]);

    return { auditLog, setAuditLog, logEvent };
};


export const useRmfAutomation = (currentRoleConfig, setMessage) => {
    // Generate a single session ID for this user's entire session
    const [sessionId] = useState(() => window.crypto.randomUUID());
    
    const { callApi, isProcessing: isApiProcessing } = useApiClient(setMessage);
    
    // --- All local state ---
    const [controls, setControls] = useState([]);
    const [poamList, setPoamList] = useState([]);
    const [assessments] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [openControlId, setOpenControlId] = useState('');
    const [localNarrative, setLocalNarrative] = useState({});

    // --- NEW Persistent Audit Log state ---
    const { auditLog, setAuditLog, logEvent } = usePersistentAuditLog(sessionId, currentRoleConfig);

    // --- Data Fetching (Core Sync Function) ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [controlsData, poamsData, auditData] = await Promise.all([
                callApi('/api/controls', { method: 'GET' }),
                callApi('/api/poams', { method: 'GET' }),
                callApi('/api/audit?limit=100', { method: 'GET' }) // <-- Fetch audit logs
            ]);

            setControls(controlsData || []);
            setPoamList(poamsData || []);
            setAuditLog(auditData || []); // <-- Set initial audit logs from DB
            
            if (!isLoading) { // Don't show this on first load
                setMessage({ type: 'info', text: `System data re-synced.` });
            }
        } catch (error) {
             setControls([]); 
             setPoamList([]);
             setAuditLog([]); // Clear on error
        } finally {
            setIsLoading(false);
        }
    }, [setMessage, callApi, setAuditLog, isLoading]); // <-- Added dependencies

    // Initial data fetch and system start log
    useEffect(() => {
        fetchData();
        logEvent('APPLICATION_START', 'Application initialized.', 'System');
    }, [fetchData]); // <-- Run only once on mount

    // --- Derived State (Scorecard Logic) ---
    const { total, implemented, complianceScore, riskPosture } = useMemo(() => {
        // ... (this logic is unchanged)
        const totalControls = controls.length;
        const implementedCount = controls.filter(c => c.status === 'Implemented').length;
        const partiallyImplemented = controls.filter(c => c.status === 'Partially Implemented').length;
        const na = controls.filter(c => c.status === 'Not Applicable').length;
        const applicableControls = totalControls - na;
        const score = applicableControls > 0
            ? Math.round(((implementedCount + (partiallyImplemented * 0.5)) / applicableControls) * 100)
            : 0;
        const openHighPoams = poamList.filter(p => p.status === 'Open' && p.severity === 'High').length;
        let posture = 'Acceptable';
        if (openHighPoams > 5) posture = 'Very High Risk';
        else if (openHighPoams > 0) posture = 'High Risk';
        else if (controls.some(c => c.status === 'Not Implemented')) posture = 'Moderate Risk';

        return {
            total: totalControls,
            implemented: implementedCount,
            complianceScore: score,
            riskPosture: posture
        };
    }, [controls, poamList]);
    
    // --- Core Action Handlers (Now use logEvent) ---

    const handleSaveNarrative = useCallback(async (controlId, newNarrative) => {
        if (!currentRoleConfig.permissions.includes('edit_controls')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
        if (!controlId) return;

        try {
            const result = await callApi(`/api/controls/${controlId}/update`, { method: 'POST', body: JSON.stringify({ procedure: newNarrative }) });
            if (!result) return; // API client handles error message
            
            setControls(prev => prev.map(c => c.control_id === controlId ? result.control : c));
            await logEvent('SSP_NARRATIVE_EDIT', `${controlId} narrative manually updated.`);
            setMessage({ type: 'success', text: `SSP Narrative for ${controlId} saved.` });
        } catch (error) { /* Handled by useApiClient */ }
    }, [currentRoleConfig, setMessage, callApi, logEvent]);

    const handleManualStatusChange = useCallback(async (newStatus, controlIdToUpdate) => {
        if (!currentRoleConfig.permissions.includes('edit_controls')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
        
        try {
            const result = await callApi(`/api/controls/${controlIdToUpdate}/update`, { method: 'POST', body: JSON.stringify({ status: newStatus }) });
            if (!result) return;

            setControls(prev => prev.map(c => c.control_id === controlIdToUpdate ? result.control : c));
            await logEvent('STATUS_OVERRIDE', `${controlIdToUpdate} status manually changed to ${newStatus}.`);
            setMessage({ type: 'success', text: `Status for ${controlIdToUpdate} updated to ${newStatus}.` });
        } catch (error) { /* Handled by useApiClient */ }
    }, [currentRoleConfig, setMessage, callApi, logEvent]);

    const generatePOAandM = useCallback(async () => {
         if (!currentRoleConfig.permissions.includes('edit_controls')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
        setIsProcessing(true);
        try {
            const result = await callApi('/api/poams/generate', { method: 'POST' });
            if (!result) return;
            
            if (result.count > 0) {
                 // Full fetch to get all POAMs (new and old)
                 await fetchData(); 
                 await logEvent('POA_M_GEN', `Generated ${result.count} new POA&M entries.`);
                 setMessage({ type: 'success', text: `POA&M generated: ${result.count} new deficiencies logged.` });
            } else {
                 setMessage({ type: 'info', text: 'No new deficiencies found to generate POA&M entries.' });
            }
        } catch (error) { /* Handled by useApiClient */ } finally { setIsProcessing(false); }
    }, [currentRoleConfig, setMessage, callApi, logEvent, fetchData]);

     const handlePoamClosure = useCallback(async (poamId, newStatus) => {
         if (!currentRoleConfig.permissions.includes('edit_controls')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
         try {
             const result = await callApi(`/api/poams/${poamId}/close`, { method: 'POST', body: JSON.stringify({ newStatus }) });
             if (!result) return;
             
             setPoamList(prev => prev.map(p => p.poam_id === poamId ? result.poam : p));
             const logAction = newStatus === 'Closed' ? 'POA_M_CLOSED' : 'POA_M_RISK_ACCEPTED';
             await logEvent(logAction, `Finding ${result.poam.control_id} marked as ${newStatus}.`);

             let successMsg = `POA&M finding for ${result.poam.control_id} marked as ${newStatus}.`;
             if (result.syncedControlId) {
                await fetchData(); // Refetch controls and poams
                await logEvent('CONTROL_STATUS_SYNC', `Control ${result.syncedControlId} status synchronized to 'Implemented' by POAM closure.`, 'System');
                successMsg += ` Control status auto-updated to Implemented.`;
             }
             setMessage({ type: 'success', text: successMsg });
         } catch (error) { /* Handled by useApiClient */ }
     }, [currentRoleConfig, setMessage, callApi, logEvent, fetchData]);
     
    // --- File/Import Handlers ---
    
    const handleDocumentUpload = useCallback(async () => {
        if (!fileName) { setMessage({ type: 'error', text: 'Please select a policy file first.' }); return; }
        if (!currentRoleConfig.permissions.includes('update_evidence')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
        
        setIsProcessing(true);
        try {
            const result = await callApi('/api/nlp/process_evidence', { method: 'POST', body: JSON.stringify({ fileName }) });
            if (!result) return;

            await fetchData(); // Refetch controls
            await logEvent('EVIDENCE_PROCESS', `${result.updatedCount || 0} control(s) updated by NLP analysis of "${result.artifactBaseName}".`, 'Backend.NLP');
            setMessage({ type: 'success', text: `Analysis complete on "${result.artifactBaseName}". ${result.updatedCount || 0} controls updated.` });
        } catch (error) { /* Handled by useApiClient */ } finally { setIsProcessing(false); setFileName(''); }
    }, [fileName, currentRoleConfig, setMessage, callApi, logEvent, fetchData]);

    const runContinuousMonitoring = useCallback(async () => {
        if (!currentRoleConfig.permissions.includes('update_evidence')) { setMessage({ type: 'error', text: 'Access Denied.' }); return; }
        setIsProcessing(true);
        try {
            const result = await callApi('/api/ccm/run_scan', { method: 'POST' });
            if (!result) return;

            await fetchData(); // Refetch controls
            await logEvent('CCM_RUN', `${result.statusUpdates} control status(es) updated by CCM scan.`, 'Backend.CCM');
            setMessage({ type: 'success', text: `CCM scan complete: ${result.statusUpdates} controls updated.` });
        } catch (error) { /* Handled by useApiClient */ } finally { setIsProcessing(false); }
    }, [currentRoleConfig, setMessage, callApi, logEvent, fetchData]);


    // Generic handler for all file uploads
    const handleGenericUpload = useCallback(async (event, importType) => {
         const file = event.target.files[0];
         if (!file) return;

         if (!currentRoleConfig.permissions.includes('update_evidence') && !currentRoleConfig.permissions.includes('edit_controls')) {
            setMessage({ type: 'error', text: 'Access Denied.' });
            return;
         }

         const endpointMap = {
             emass: '/api/import/emass', nessus: '/api/import/nessus', scap: '/api/import/scap', ckl: '/api/import/ckl',
             xacta: '/api/import/xacta',
         };
         const endpoint = endpointMap[importType];

         setIsProcessing(true);
         setMessage({ type: 'info', text: `Importing ${importType.toUpperCase()} file: ${file.name}...` });
         try {
             const formData = new FormData();
             formData.append('file', file);
             
             const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', body: formData, headers: {} });
             const result = await response.json();
             if (!response.ok) throw new Error(result.message || `Server error during ${importType} upload.`);
             
             await fetchData(); // Crucial: sync state after backend mutation
             const count = result.updatedCount || result.findingsAdded || 0;
             await logEvent(`IMPORT_${importType.toUpperCase()}`, `Imported ${count} items/findings from ${file.name}.`, `Backend.${importType.toUpperCase()}`);
             setMessage({ type: 'success', text: `${importType.toUpperCase()} import successful from ${file.name}. ${count} items/findings processed.` });
         } catch (error) {
              setMessage({ type: 'error', text: `${importType.toUpperCase()} Import Error: ${error.message}` });
         } finally {
              setIsProcessing(false);
              event.target.value = null;
         }
     }, [currentRoleConfig, setMessage, fetchData, logEvent]);

     const handleEmassBaselineUpload = (e) => handleGenericUpload(e, 'emass');
     const handleXactaUpload = (e) => handleGenericUpload(e, 'xacta');


    // --- Exports (Triggers download from backend API) ---
    const handleExport = useCallback(async (format) => {
        if (!currentRoleConfig.permissions.includes('edit_controls')) { setMessage({ type: 'error', text: 'Access Denied: Cannot export data.' }); return; }
        setIsProcessing(true);
        setMessage({ type: 'info', text: `Preparing ${format} export...` });
        try {
            const endpointMap = { ControlsCSV: '/api/export/controls-csv', PoamCSV: '/api/export/poam-csv', OSCAL: '/api/export/oscal' };
            const endpoint = endpointMap[format];
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`Server failed to generate export.`);
            
            const blob = await response.blob();
            const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export_${format}.json`;
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);

            await logEvent(`EXPORT_${format.toUpperCase()}`, `Exported ${format} file: ${fileName}`, 'UI.Export');
            setMessage({ type: 'success', text: `${format} exported successfully as ${fileName}.` });
        } catch (error) {
             setMessage({ type: 'error', text: `Export failed: ${error.message}` });
        } finally {
             setIsProcessing(false);
        }
    }, [currentRoleConfig, setMessage, logEvent]);

    // --- Return all state and handlers ---
    return {
        controls, poamList, assessments, fileName, setFileName, 
        isProcessing: isProcessing || isApiProcessing,
        isLoading, openControlId, setOpenControlId, localNarrative, setLocalNarrative,
        complianceScore, riskPosture, total, implemented, 
        auditLog, // <-- EXPOSE THE LOG
        fetchData, 
        runContinuousMonitoring, generatePOAandM, handlePoamClosure, 
        handleDocumentUpload, handleSaveNarrative, handleManualStatusChange,
        handleEmassBaselineUpload, handleXactaUpload,
        handleExport,
    };
};