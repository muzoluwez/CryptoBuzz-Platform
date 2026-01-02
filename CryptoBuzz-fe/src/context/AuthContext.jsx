
import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectCurrentToken,
    setCredentials,
    logout as logoutAction
} from '@/store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const token = useSelector(selectCurrentToken);

    const login = (userData, token) => {
        dispatch(setCredentials({ user: userData, token }));
    };

    const logout = () => {
        dispatch(logoutAction());
    };

    const value = {
        user,
        isAuthenticated,
        token,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
