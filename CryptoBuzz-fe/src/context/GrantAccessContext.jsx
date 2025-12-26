
import React, { createContext, useContext } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';

const GrantAccessContext = createContext(null);

export const GrantAccessProvider = ({ children }) => {
    // Reusing the existing hook logic to maintain consistency
    const { checkAccess, canAccessContent } = useAccessControl();

    const value = {
        checkAccess,
        canAccessContent
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
