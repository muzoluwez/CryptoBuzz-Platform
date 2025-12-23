
import React from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import { Button } from '@/components/ui/button'; // Assuming shadcn UI or similar exists
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

/**
 * AccessGate Component
 * 
 * Wraps content that requires specific access permissions.
 * If access is granted, renders children.
 * If access is denied, renders a fallback UI.
 * 
 * @param {Object} props
 * @param {string} props.accessType - 'PUBLIC' | 'LOGIN' | 'PLAN_BASED' | 'UID_ONLY'
 * @param {string[]} [props.allowedPlans] - Array of allowed plans/tiers
 * @param {string} [props.contentUid] - Specific User ID allowed to view this content
 * @param {Object} [props.user] - Optional direct user overrides (though hook handles it)
 * @param {React.ReactNode} props.children - Content to show if allowed
 * @param {React.ReactNode} [props.fallback] - Custom fallback UI. If not provided, uses default.
 * @param {boolean} [props.hideFallback] - If true, renders nothing instead of fallback when denied.
 */
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
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>

            {reason === 'LOGIN_REQUIRED' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Login Required</h3>
                    <p className="text-gray-500 max-w-sm">
                        This content is valid for logged-in users only. Please log in to continue accessing exclusive insights and ideas.
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full sm:w-auto">
                        Log In
                    </Button>
                </div>
            )}

            {reason === 'UPGRADE_REQUIRED' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Upgrade to {allowedPlans?.join(' or ')}</h3>
                    <p className="text-gray-500 max-w-sm">
                        This content is available exclusively under the {allowedPlans?.join(', ')} plan.
                        Upgrade your account to unlock this and more.
                    </p>
                    <Button onClick={() => navigate('/pricing')} variant="default" className="w-full sm:w-auto">
                        Upgrade Plan
                    </Button>
                </div>
            )}

            {(reason === 'NO_PERMISSION' || reason === 'UNKNOWN_ACCESS_TYPE') && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Access Denied</h3>
                    <p className="text-gray-500 max-w-sm">
                        You do not have permission to view this content.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full sm:w-auto">
                        Go Home
                    </Button>
                </div>
            )}
        </div>
    );
}
