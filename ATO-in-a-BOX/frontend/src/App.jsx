// src/App.jsx
import React, { useState, useCallback } from 'react';
import { useRmfAutomation } from './hooks/use_Rmf_Automation';
import MessageAlert from './components/Shared/Message_Alert';
import TabButton from './components/Controls/Tab_Button';
import DashboardTab from './components/Dashboard/Dashboard_Tab';
import ControlReviewTab from './components/Controls/Control_Review_Tab';
import PoamAutomationTab from './components/Poam/Poam_Automation_Tab';
import { ROLES } from './Constants';
// Removed audit log and sha256 imports

// Main App Component
const App = () => {
    // NOTE: sessionId and auditLog state are now managed in use_Rmf_Automation
    const [currentRole, setCurrentRole] = useState('ISSM');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [message, setMessage] = useState(null);
    const [atoStatus] = useState('Pending Authorization');
    
    const currentRoleConfig = ROLES[currentRole];

    // --- Core Logic Hook Integration ---
    const {
        controls, poamList, assessments, fileName, setFileName, isProcessing,
        openControlId, setOpenControlId, localNarrative, setLocalNarrative,
        complianceScore, riskPosture, total, implemented,
        auditLog, // <-- Get auditLog from the hook
        
        // API-driven Handlers exposed by the hook
        runContinuousMonitoring, generatePOAandM, handlePoamClosure, handleDocumentUpload,
        handleSaveNarrative, handleManualStatusChange,
        handleEmassBaselineUpload, handleXactaUpload, handleExport
    } = useRmfAutomation(currentRoleConfig, setMessage); // <-- Pass only setMessage

    // File change handler (still required in App for input control)
    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) { setFileName(file.name); setMessage({ type: 'info', text: `File "${file.name}" uploaded. Click Analyze to run NLP.` }); }
        event.target.value = null; 
    }, [setFileName, setMessage]);
    
    // Editor handlers (kept simple here)
    const toggleControlEditor = useCallback((controlId) => { setOpenControlId(prevId => prevId === controlId ? '' : controlId); }, [setOpenControlId]);
    const handleLocalNarrativeChange = useCallback((controlId, value) => { setLocalNarrative(prev => ({ ...prev, [controlId]: value })); }, [setLocalNarrative]);

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-900 text-white font-sans antialiased">
            {/* ... (style tag unchanged) ... */}
            <style>{`
                .cyber-button { transition: all 0.2s; box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.2); text-shadow: 0 0 5px rgba(0, 255, 255, 0.8); }
                .cyber-button:hover { box-shadow: 0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.5); }
                .progress-bar { background: linear-gradient(to right, #00ffff, #008080); }
            `}</style>

            <header className="mb-8 border-b border-gray-700 pb-4">
                {/* ... (Header content unchanged) ... */}
            </header>
            
            <MessageAlert message={message} />

            {/* Tabs Navigation */}
            <div className="border-b border-gray-700 mb-6 flex space-x-4">
                <TabButton id="dashboard" label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />
                <TabButton id="controls" label="Controls" activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />
                <TabButton id="poam" label="POA&M" activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />
                <TabButton id="risk" label="Risk Register" activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />
                <TabButton id="audit" label="Audit Trail" activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />

                {/* Role Switcher */}
                <select onChange={(e) => setCurrentRole(e.target.value)} value={currentRole} className="ml-auto px-3 py-1 bg-gray-700 text-white rounded-lg self-center">
                    {Object.keys(ROLES).map(roleKey => <option key={roleKey} value={roleKey}>{ROLES[roleKey].name}</option>)}
                </select>
            </div>

            <div className="space-y-8">
                {activeTab === 'dashboard' && (
                    <DashboardTab 
                        complianceScore={complianceScore} total={total} implemented={implemented} riskPosture={riskPosture}
                        isProcessing={isProcessing} currentRoleConfig={currentRoleConfig} controls={controls}
                        runContinuousMonitoring={runContinuousMonitoring}
                    />
                )}

                {activeTab === 'controls' && (
                    <ControlReviewTab
                        controls={controls} openControlId={openControlId} localNarrative={localNarrative}
                        currentRoleConfig={currentRoleConfig} total={total} isProcessing={isProcessing} fileName={fileName}
                        handleFileChange={handleFileChange} 
                        handleDocumentUpload={handleDocumentUpload} 
                        handleEmassBaselineUpload={handleEmassBaselineUpload}
                        handleXactaUpload={handleXactaUpload}
                        toggleControlEditor={toggleControlEditor} handleLocalNarrativeChange={handleLocalNarrativeChange}
                        handleSaveNarrative={handleSaveNarrative} handleManualStatusChange={handleManualStatusChange}
                    />
                )}

                {activeTab === 'poam' && (
                    <PoamAutomationTab 
                        poamList={poamList} currentRoleConfig={currentRoleConfig} generatePOAandM={generatePOAandM} 
                        handlePoamClosure={handlePoamClosure} 
                        exportControlsToEmassCsv={() => handleExport('ControlsCSV')}
                        exportPoamToEmassCsv={() => handleExport('PoamCSV')}
                        handleExport={() => handleExport('OSCAL')}
                    />
                )}
                
                {activeTab === 'risk' && <div className="p-4 bg-gray-800 rounded-lg text-gray-400">Risk Register View: Total High Risk POA&Ms: {poamList.filter(p => p.severity === 'High' && p.status === 'Open').length}</div>}
                
                {/* Audit tab now reads from the hook's state */}
                {activeTab === 'audit' && (
                    <div className="p-4 bg-gray-800 rounded-lg text-gray-400">
                        <h2 className="text-xl font-semibold mb-4 text-white">Persistent Audit Trail (Last {auditLog.length} events)</h2>
                        <div className="overflow-auto max-h-[600px] bg-gray-900 p-2 rounded">
                            <pre className="text-xs">
                                {auditLog.map(log => (
                                    <div key={log.event_id || log.eventId} className="border-b border-gray-700 py-1">
                                        <span className="text-cyan-400">[{new Date(log.timestamp).toLocaleString()}]</span>
                                        <span className="text-yellow-400"> [{log.role}]</span>
                                        <span className="text-white"> {log.action}:</span>
                                        <span className="text-gray-300"> {log.details}</span>
                                        <span className="text-gray-500"> (Origin: {log.origin})</span>
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;