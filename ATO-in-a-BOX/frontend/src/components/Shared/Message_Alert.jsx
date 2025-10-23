import React from 'react';

const MessageAlert = React.memo(({ message }) => {
    if (!message) return null;

    const baseClass = 'p-4 rounded-lg mb-6 border';
    let typeClass = '';

    if (message.type === 'error') {
        typeClass = 'bg-red-900/50 text-red-300 border-red-500';
    } else if (message.type === 'success') {
        typeClass = 'bg-green-900/50 text-green-300 border-green-500';
    } else {
        typeClass = 'bg-blue-900/50 text-blue-300 border-blue-500';
    }

    return (
        <div className={`${baseClass} ${typeClass}`} role="alert">
            {message.text}
        </div>
    );
});

export default MessageAlert;