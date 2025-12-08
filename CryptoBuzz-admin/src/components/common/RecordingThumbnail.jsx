import React from 'react';

/**
 * RecordingThumbnail Component
 * 
 * Displays a thumbnail for a recording with play button overlay.
 * Used in admin recording session views.
 */
const RecordingThumbnail = ({ thumbnail, title, duration }) => {
    return (
        <div className="relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={title || 'Recording thumbnail'}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                </div>
            )}
            {duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {duration}
                </div>
            )}
        </div>
    );
};

export default RecordingThumbnail;



