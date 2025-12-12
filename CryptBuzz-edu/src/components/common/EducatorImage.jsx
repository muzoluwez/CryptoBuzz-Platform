import React from 'react';

/**
 * EducatorImage Component
 * 
 * Displays educator profile image with fallback to initials.
 */
const EducatorImage = ({ educator, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold`}>
            {educator?.profileImage || educator?.image ? (
                <img
                    src={educator.profileImage || educator.image}
                    alt={educator.name || 'Educator'}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{getInitials(educator?.name || educator?.fullName)}</span>
            )}
        </div>
    );
};

export default EducatorImage;



