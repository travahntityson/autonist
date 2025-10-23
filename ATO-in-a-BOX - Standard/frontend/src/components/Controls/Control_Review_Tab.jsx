import React from 'react';
import ControlFamilyAccordion from './Control_Family_Accordion';

const ControlReviewTab = React.memo(({ controls, openControlId, localNarrative, currentRoleConfig, total, isProcessing, fileName, handleFileChange, handleDocumentUpload, handleEmassBaselineUpload, handleXactaUpload, toggleControlEditor, handleLocalNarrativeChange, handleSaveNarrative, handleManualStatusChange }) => (
    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
        <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6 text-white border-l-4 border-cyan-400 pl-3">NIST SP 800-53 Control Inventory & SSP Editor ({total} Items)</h2>
            
            {/* AI/NLP Automation Card (Unchanged) */}
            <div className='mt-4 p-6 rounded-xl bg-gray-800 border border-cyan-500/50 shadow-2xl'>
                <h3 className='text-xl font-semibold mb-3 text-cyan-400'>Automated Documentation Analysis (AI/NLP + CCI)</h3>
                <p className='text-sm text-gray-400 mb-4'>Upload policy documents (simulated OCR) to trigger the RAG engine for targeted SSP narrative extraction and the CCI engine for technical compliance status updates.</p>
                <div className='flex items-center space-x-4'>
                    <label htmlFor="file-upload" className="cyber-button cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm disabled:bg-gray-600 disabled:shadow-none">
                        {fileName ? `Policy File: ${fileName}` : 'Upload Policy Document (OCR Prerequisite)'}
                    </label>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isProcessing || !currentRoleConfig.permissions.includes('update_evidence')} />
                    <button 
                        onClick={handleDocumentUpload} 
                        disabled={isProcessing || !fileName || !currentRoleConfig.permissions.includes('update_evidence')} 
                        className="cyber-button px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:bg-gray-600 disabled:shadow-none"
                    >
                        {isProcessing ? 'Analyzing Evidence...' : 'Analyze & Auto-Populate Controls'}
                    </button>
                    {!currentRoleConfig.permissions.includes('update_evidence') && (<p className='text-red-400 text-sm'>Access Denied</p>)}
                </div>
            </div>

            {/* Baseline Import Card (eMASS) */}
            <div className='mt-6 p-6 rounded-xl bg-gray-800 border border-yellow-500/50 shadow-2xl'>
                <h3 className="text-xl font-semibold mb-3 text-yellow-400">Import Existing eMASS Baseline</h3>
                <p className='text-sm text-gray-400 mb-4'>Use this feature to load inherited controls and previous SSP narratives from a structured CSV export (e.g., your "Main Control Matrix").</p>
                <input 
                    id="emass-upload" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleEmassBaselineUpload} 
                    disabled={!currentRoleConfig.permissions.includes('edit_controls')} 
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 disabled:opacity-50" 
                />
            </div>
            
            {/* NEW XACTA/OSCAL Import Card */}
            <div className='mt-6 p-6 rounded-xl bg-gray-800 border border-green-500/50 shadow-2xl'>
                <h3 className="text-xl font-semibold mb-3 text-green-400">Import Xacta/OSCAL SSP</h3>
                <p className='text-sm text-gray-400 mb-4'>Load a System Security Plan exported in **OSCAL/JSON** format from a partner system (e.g., Xacta).</p>
                <input 
                    id="xacta-upload" 
                    type="file" 
                    accept=".json" 
                    onChange={handleXactaUpload} 
                    disabled={!currentRoleConfig.permissions.includes('edit_controls')} 
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 disabled:opacity-50" 
                />
            </div>
            
            <ControlFamilyAccordion 
                controls={controls} 
                openControlId={openControlId} 
                localNarrative={localNarrative} 
                currentRoleConfig={currentRoleConfig} 
                toggleControlEditor={toggleControlEditor} 
                handleLocalNarrativeChange={handleLocalNarrativeChange} 
                handleSaveNarrative={handleSaveNarrative} 
                handleManualStatusChange={handleManualStatusChange} 
            />
        </div>
    </div>
));

export default ControlReviewTab;