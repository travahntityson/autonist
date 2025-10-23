import React from 'react';

const TabButton = React.memo(({ id, label, activeTab, setActiveTab, currentRole }) => (
    <button 
        role="tab" // <-- ARIA: This is a tab
        id={`tab-${id}`} // <-- ARIA: This is the button's ID
        aria-controls={`panel-${id}`} // <-- ARIA: This button controls the panel with this ID
        aria-selected={activeTab === id} // <-- ARIA: This is the selected tab
        onClick={() => setActiveTab(id)} 
        className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 
            ${activeTab === id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`
        }
        disabled={id === 'authorization' && currentRole !== 'AO'} 
    >
        {label}
        {id === 'authorization' && currentRole === 'AO' && <span className='ml-2 text-xs bg-red-700/50 px-2 py-0.5 rounded'>AO ONLY</span>}
    </button>
));

export default TabButton;
