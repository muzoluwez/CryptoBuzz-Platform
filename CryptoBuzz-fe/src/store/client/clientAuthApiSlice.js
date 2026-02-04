
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientAuthApiSlice = createApi({
    reducerPath: 'clientAuthApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/users/auth/signin',
                method: 'POST',
                body: credentials,
            }),
        }),
        signup: builder.mutation({
            query: (userData) => ({
                url: '/users/auth/signup',
                method: 'POST',
                body: userData,
            }),
        }),
        verifyEmail: builder.mutation({
            query: (token) => ({
                url: `/users/auth/verify-email?token=${encodeURIComponent(token)}`,
                method: 'GET',
            }),
        }),
    }),
});

export const { useLoginMutation, useSignupMutation, useVerifyEmailMutation } = clientAuthApiSlice;
