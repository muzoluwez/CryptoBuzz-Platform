import React, { createContext, useContext, useState } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';


const GrantAccessContext = createContext(null);

export const GrantAccessProvider = ({ children }) => {
    // Reusing the existing hook logic to maintain consistency
    const { checkAccess, canAccessContent } = useAccessControl();
     const [volume, setVolume] = useState(1);
     const [isMuted, setIsMuted] = useState(false);

    const value = {
        checkAccess,
        canAccessContent,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
    };

    return (
        <GrantAccessContext.Provider value={value}>
            {children}
        </GrantAccessContext.Provider>
    );
};

export const useGrantAccess = () => {
    const context = useContext(GrantAccessContext);
    if (!context) {
        throw new Error('useGrantAccess must be used within a GrantAccessProvider');
    }
    return context;
};