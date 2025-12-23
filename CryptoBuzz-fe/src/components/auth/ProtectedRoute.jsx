
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';

/**
 * ProtectedRoute Guard
 * 
 * If user is authenticated, render child routes.
 * If not, redirect to /login, preserving the current location state.
 */
export function ProtectedRoute({ children }) {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();
    const token = localStorage.getItem('token'); // Double check persistence

    // If we have a user in store OR a token in local storage (basic check), we consider them logged in (or rehydrating).
    // Ideally, app should rehydrate state on load. 
    // If state is empty but token exists, we might want to wait for rehydration or allow access optimistically.
    // Given current Redux setup, assuming rehydration happens early or we rely on token presence for routing.

    if (!user && !token) {
        // Redirect to the login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
