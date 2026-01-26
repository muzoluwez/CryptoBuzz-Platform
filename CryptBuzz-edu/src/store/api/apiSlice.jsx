import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
       baseUrl: `${import.meta.env.VITE_APP_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token || JSON.parse(localStorage.getItem("auth"))?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
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

        // Handle "Invalid or expired token" error message
        if (data?.message === "Invalid or expired token" || 
            status === 401 || 
            data?.error === "jwt expired" || 
            data?.error === "invalid signature" ||
            data?.error === "Invalid or expired access token") {
            
            // Clear local storage
            localStorage.clear();
            sessionStorage.clear();

            // Redirect user to home page
            window.location.href = "/auth/login"; // Adjust route as needed
        }
    }

    return result;
};

export default baseQueryWithReauth;




