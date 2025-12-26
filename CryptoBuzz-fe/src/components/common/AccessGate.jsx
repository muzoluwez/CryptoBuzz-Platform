
import React from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import { useNavigate } from 'react-router-dom';
import { LoginRequired } from './access-states/LoginRequired';
import { UpgradeRequired } from './access-states/UpgradeRequired';
import { AccessDenied } from './access-states/AccessDenied';


export function AccessGate({
    accessType,
    allowedPlans,
    contentUid,
    children,
    fallback,
    hideFallback = false,
    ownerId
}) {
    const { checkAccess } = useAccessControl();
    const navigate = useNavigate();

    const { hasAccess, reason } = checkAccess({
        accessType,
        allowedPlans,
        contentUid,
        ownerId
    });

    if (hasAccess) {
        return <>{children}</>;
    }

    if (hideFallback) {
        return null;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Default Fallback UI
    if (reason === 'LOGIN_REQUIRED') {
        return <LoginRequired onLogin={() => navigate('/login')} />;
    }

    if (reason === 'UPGRADE_REQUIRED') {
        return <UpgradeRequired allowedPlans={allowedPlans} onUpgrade={() => navigate('/pricing')} />;
    }

    if (reason === 'NO_PERMISSION' || reason === 'UNKNOWN_ACCESS_TYPE') {
        return <AccessDenied onGoHome={() => navigate('/')} />;
    }

    return null;
}
