import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorProfileApiSlice = createApi({
    reducerPath: 'educatorProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorProfile: builder.query({
            query: () => `/common/auth/profile`,
        }),
        getEducatorDashboard: builder.query({
            query: () => `/common/dashboard/`,
        }),
        updateEducatorProfile: builder.mutation({
            query: (updatedData) => ({
                url: `/common/auth/update`,
                method: 'PUT',
                body: updatedData,
                formData: true
            }),
        }),
    }),
});

export const { useGetEducatorProfileQuery, useGetEducatorDashboardQuery, useUpdateEducatorProfileMutation } = educatorProfileApiSlice;
