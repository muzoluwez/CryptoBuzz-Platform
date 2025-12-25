
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';

export function useAccessControl() {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    /**
     * Checks if user has access based on content access settings.
     * 
     * @param {Object} params
     * @param {string} params.accessType - 'PUBLIC' | 'LOGIN' | 'PLAN_BASED' | 'UID_ONLY'
     * @param {string[]} [params.allowedPlans] - Array of allowed plans/tiers e.g. ['PRO', 'PREMIUM']
     * @param {string} [params.contentUid] - Specific User ID allowed to view this content (for UID_ONLY)
     * @param {string} [params.ownerId] - ID of the owner of the content (usually the content creator) - owners always have access
     * @returns {Object} { hasAccess: boolean, reason: string }
     */
    const checkAccess = ({ accessType, allowedPlans = [], contentUid, ownerId }) => {
        // 1. PUBLIC: Everyone has access
        if (!accessType || accessType === 'PUBLIC') {
            return { hasAccess: true, reason: null };
        }

        // 2. LOGIN: User must be authenticated
        if (!isAuthenticated) {
            return { hasAccess: false, reason: 'LOGIN_REQUIRED' };
        }

        // Owner always has access if logged in
        if (ownerId && user?._id === ownerId) {
            return { hasAccess: true, reason: 'OWNER_ACCESS' };
        }

        // 3. LOGGED_IN (Explicit): Just needing authentication (covered above, but handled explicitly if expected)
        if (accessType === 'LOGGED_IN' || accessType === 'LOGIN') {
            return { hasAccess: true, reason: null };
        }

        // 4. PLAN_BASED: User must have a matching plan/tier
        if (accessType === 'PLAN_BASED' || accessType === 'PLANNAME') {
            // Assuming user.plan.name or user.tier holds the plan info. 
            // Adjust based on actual user object structure.
            // If allowedPlans is empty, assume it means "Any Plan" (which is basically just logged in, but let's be strict)
            // If allowedPlans is present, check against user's plan.

            const userPlan = user?.plan?.name || user?.tier || 'FREE'; // Fallback

            // Normalize comparison (uppercase)
            const normalizedUserPlan = String(userPlan).toUpperCase();
            const normalizedAllowedPlans = allowedPlans.map(p => String(p).toUpperCase());

            if (normalizedAllowedPlans.includes(normalizedUserPlan)) {
                return { hasAccess: true, reason: null };
            } else {
                return { hasAccess: false, reason: 'UPGRADE_REQUIRED' };
            }
        }

        // 5. UID_ONLY / UID: Specific user access
        if (accessType === 'UID_ONLY' || accessType === 'UID') {
            if (contentUid && user?._id === contentUid) {
                return { hasAccess: true, reason: null };
            }
            return { hasAccess: false, reason: 'NO_PERMISSION' };
        }

        // Default: Deny if unknown access type
        console.warn(`Unknown accessType: ${accessType}`);
        return { hasAccess: false, reason: 'UNKNOWN_ACCESS_TYPE' };
    };

    /**
     * Simplified boolean check.
     */
    const canAccessContent = (params) => {
        return checkAccess(params).hasAccess;
    };

    return {
        canAccessContent,
        checkAccess,
        user,
        isAuthenticated
    };
}
