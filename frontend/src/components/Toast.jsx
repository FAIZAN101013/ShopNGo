import React from 'react';

const Toast = ({ type, message, onClose }) => {
    return (
        <div className={`
      fixed top-4 right-4 !p-4 rounded-lg shadow-lg z-50 transition-all duration-300
      ${type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
    `}>
            <div className="flex items-center !gap-2">
                {type === 'success' ? (
                    <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                <p className="font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="!ml-4 hover:opacity-75"
                >
                    <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast; 