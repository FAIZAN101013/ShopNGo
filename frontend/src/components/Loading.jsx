import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center !min-h-[200px]">
            <div className="!w-12 !h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
    );
};

export default Loading; 