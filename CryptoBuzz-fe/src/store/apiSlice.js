import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_APP_API_URL}/api/v1` || "http://localhost:8000/api/v1",
    prepareHeaders: (headers, { getState }) => {
        // Try to get token from Redux state first
        let token = getState().auth?.token;
        let tokenSource = 'Redux';
        
        // Fallback to localStorage if not in Redux state
        if (!token) {
            token = localStorage.getItem('token') || sessionStorage.getItem('token');
            tokenSource = localStorage.getItem('token') ? 'localStorage' : (sessionStorage.getItem('token') ? 'sessionStorage' : 'none');
        }
        
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
            // Log token info for debugging (only first few chars for security)
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔑 Token added to headers (source: ${tokenSource}, length: ${token.length})`);
            }
        } else {
            console.warn('⚠️ No token found in Redux, localStorage, or sessionStorage');
        }
        
        return headers;
    },
});

// Custom baseQuery wrapper to handle 401 errors
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Check for JWT Expiry or Unauthorized errors
    if (result.error) {
        const { status, data } = result.error;

        // Log error details for debugging
        console.error('🚨 API Error:', {
            url: args?.url || 'unknown',
            method: args?.method || 'GET',
            status,
            statusText: result.error?.statusText,
            data,
            message: data?.message || result.error?.error || 'Unknown error'
        });


        // Handle "Invalid or expired token" error message
        if (data?.message === "Invalid or expired token" || 
            status === 401 || 
            data?.error === "jwt expired" || 
            data?.error === "invalid signature" ||
            data?.error === "Invalid or expired access token") {
            console.warn("⚠️ JWT expired or invalid! Message:", data?.message || result.error?.error);
            
            // Only redirect on actual auth failures, not on missing token for public endpoints
            // Clear local storage
            localStorage.clear();
            sessionStorage.clear();

            // Redirect user to home page
            window.location.href = "/login"; // Adjust route as needed
        }
    }

    return result;
};

export default baseQueryWithReauth;
