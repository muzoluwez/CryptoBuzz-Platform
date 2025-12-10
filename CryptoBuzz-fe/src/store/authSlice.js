import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.clear();
        },
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.clear();
        },
        clearLocalStorage: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.clear();
        }
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
