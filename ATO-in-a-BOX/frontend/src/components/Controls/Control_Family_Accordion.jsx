import React, { useState, useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify'; // <-- IMPORT DOMPURIFY
import StatusPill from './Status_Pill';
import { CONTROL_FAMILIES, CONTROL_FAMILY_CODES, CONTROL_STATUSES } from '../../Constants';

const ControlFamilyAccordion = React.memo(({ controls, openControlId, localNarrative, currentRoleConfig, toggleControlEditor, handleLocalNarrativeChange, handleSaveNarrative, handleManualStatusChange }) => {
    const [expandedFamilies, setExpandedFamilies] = useState({});

    // ... (groupedControls function remains the same) ...
    const groupedControls = useMemo(() => {
        const groups = {}; 
        CONTROL_FAMILY_CODES.forEach(familyCode => { 
            groups[familyCode] = { title: CONTROL_FAMILIES[familyCode] || familyCode, controls: new Map(), status: 'Not Scoped', totalControls: 0 }; 
        });

        controls.forEach(control => {
            const isEnhancement = control.id.includes('(');
            if (groups[control.family]) {
                if (!isEnhancement) { 
                    groups[control.family].controls.set(control.id, { ...control, enhancements: [] }); 
                } else { 
                    const baseIdMatch = control.id.match(/^[A-Z]{2}-\d+/); 
                    if (baseIdMatch) { 
                        const baseId = baseIdMatch[0]; 
                        const parentControl = groups[control.family].controls.get(baseId); 
                        if (parentControl) { 
                            parentControl.enhancements.push(control); 
                        } 
                    } 
                }
            }
        });

        Object.keys(groups).forEach(familyCode => {
            const group = groups[familyCode]; 
            group.controls = Array.from(group.controls.values());
            const allItems = [...group.controls.flatMap(c => [c, ...c.enhancements])]; 
            group.totalControls = allItems.length;

            if (allItems.length === 0) group.status = 'Not Scoped';
            else if (allItems.some(c => c.status === 'Not Implemented')) group.status = 'Not Implemented';
            else if (allItems.some(c => c.status === 'Partially Implemented')) group.status = 'Partially Implemented';
            else group.status = 'Implemented';
        });
        return groups;
    }, [controls]);


    const toggleFamily = useCallback((familyCode) => { setExpandedFamilies(prev => ({ ...prev, [familyCode]: !prev[familyCode] })); }, []);

    const renderControlItem = (control, isEnhancement = false) => {
        const isEditing = openControlId === control.id; 
        const paddingClass = isEnhancement ? 'ml-8' : 'ml-4'; 
        const controlType = isEnhancement ? 'Enhancement' : 'Control';
        const currentNarrative = localNarrative[control.id] !== undefined ? localNarrative[control.id] : control.procedure; 

        // --- SECURITY FIX: Sanitize the narrative before rendering ---
        const sanitizedNarrative = DOMPurify.sanitize(control.procedure);
        // -------------------------------------------------------------

        return (
            <div 
                key={control.id} 
                className={`${paddingClass} p-3 border-l-4 my-3 rounded-md transition-all duration-150 ${isEditing ? 'border-cyan-400 bg-gray-800 shadow-lg' : 'border-cyan-500/30 bg-gray-900/50'}`}
            >
                <button 
                    className="w-full text-left flex justify-between items-start" 
                    onClick={() => toggleControlEditor(control.id)} 
                    aria-expanded={isEditing} 
                    aria-controls={`editor-${control.id}`} 
                >
                    <div>
                        <h4 className={`text-md font-semibold ${isEnhancement ? 'text-gray-300' : 'text-white'}`}>
                            {control.id} - {control.title}
                        </h4>
                        <div className="mt-1 text-xs text-gray-400 truncate max-w-lg">
                            <span className="font-semibold text-cyan-300/80">{controlType} Narrative:</span> 
                            {/* --- SECURITY FIX: Render sanitized HTML --- */}
                            <span 
                                className="ml-1"
                                dangerouslySetInnerHTML={{ 
                                    __html: sanitizedNarrative || '<i class="text-gray-500">Click to add SSP Narrative...</i>' 
                                }} 
                            />
                            {/* ------------------------------------------- */}
                        </div>
                    </div>
                    <div className='flex flex-col items-end space-y-1'>
                        <StatusPill status={control.status} severity={control.severity} size='xs' isInherited={control.inheritance === 'Inherited'} />
                        {control.artifacts.length > 0 && <span className='text-xs text-green-400/80'>{control.artifacts.length} Artifacts Mapped</span>}
                    </div>
                </button>

                {isEditing && (
                    <div id={`editor-${control.id}`} role="region" className="mt-4 p-4 border-t border-gray-700 space-y-4">
                        <h5 className="text-sm font-semibold text-cyan-300/80">SSP Narrative ({control.id} Answer)</h5>
                        {/* The textarea is SAFE. It displays text, it doesn't render HTML. */}
                        <textarea 
                            className="w-full h-24 p-2 text-sm rounded-lg bg-gray-900 border border-gray-600 text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 resize-none" 
                            value={currentNarrative} 
                            onChange={(e) => handleLocalNarrativeChange(control.id, e.target.value)} 
                            disabled={!currentRoleConfig.permissions.includes('edit_controls')} 
                            aria-label={`Edit SSP Narrative for ${control.id}`} 
                        />
                        <div className="flex justify-between items-center pt-2">
                            <button 
                                onClick={() => handleSaveNarrative(control.id, currentNarrative)} 
                                disabled={!currentRoleConfig.permissions.includes('edit_controls') || currentNarrative === control.procedure} 
                                className="cyber-button px-4 py-2 text-sm rounded-lg bg-yellow-600 hover:bg-yellow-500 text-black font-bold disabled:bg-gray-600 disabled:text-gray-400"
                            >
                                Save Narrative & Close Editor
                            </button>
                            <div className='flex flex-wrap gap-2'>
                                {CONTROL_STATUSES.filter(s => s !== 'Not Applicable').map(status => (
                                    <button 
                                        key={status} 
                                        onClick={() => handleManualStatusChange(status, control.id)} 
                                        disabled={!currentRoleConfig.permissions.includes('edit_controls') || status === control.status} 
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors duration-150 
                                            ${status === control.status ? 'bg-cyan-700 text-white cursor-default' : 'bg-gray-600 hover:bg-cyan-600 text-white'} 
                                            disabled:bg-gray-700 disabled:text-gray-400`}
                                    >
                                        Mark {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {!isEnhancement && control.enhancements.length > 0 && (
                    <div className="mt-2">
                        {control.enhancements.map(enhancement => renderControlItem(enhancement, true))}
                    </div>
                )}
            </div>
        );
    }

    // ... (Accordion rendering logic remains the same) ...
    return (
        <div className="space-y-2">
            {CONTROL_FAMILY_CODES.map((familyCode) => {
                const familyData = groupedControls[familyCode]; 
                if (!familyData || familyData.totalControls === 0) return null;

                return (
                    <div key={familyCode} className="bg-gray-800 rounded-lg shadow-md border border-gray-700">
                        <button 
                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-700 transition-colors duration-150 rounded-lg" 
                            onClick={() => toggleFamily(familyCode)} 
                            aria-expanded={!!expandedFamilies[familyCode]}
                        >
                            <div className='flex items-center space-x-3'>
                                <span className={`text-xl font-bold ${familyData.totalControls > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>{familyCode}</span>
                                <span className="text-lg font-medium text-gray-300">{familyData.title} ({familyData.totalControls} Controls)</span>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <StatusPill status={familyData.status} size='sm' />
                                <svg className={`w-5 h-5 transition-transform duration-300 ${expandedFamilies[familyCode] ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </div>
                        </button>
                        {expandedFamilies[familyCode] && (
                            <div className="p-4 pt-0 border-t border-gray-700 bg-gray-900/50 rounded-b-lg" role="region">
                                {familyData.controls.map((control) => (
                                    <div key={control.id} className='space-y-1'>
                                        {renderControlItem(control, false)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

export default ControlFamilyAccordion;
