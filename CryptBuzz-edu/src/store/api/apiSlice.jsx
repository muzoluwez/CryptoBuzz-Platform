import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL,
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

        if (data?.error === "Invalid or expired access token") {
            // console.warn("JWT expired! Logging out...");

            // Clear local storage
            localStorage.clear();

            // Redirect user to login page
            window.location.href = "/auth/login"; // Adjust route as needed
        }
    }

    return result;
};

export default baseQueryWithReauth;




