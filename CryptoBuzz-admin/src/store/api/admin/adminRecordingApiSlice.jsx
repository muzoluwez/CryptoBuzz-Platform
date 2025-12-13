import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Recording API Slice
 * 
 * Provides endpoints for managing recordings from admin perspective.
 */
export const adminRecordingApiSlice = createApi({
    reducerPath: "adminRecording",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Get admin recordings list
        getAdminRecording: builder.query({
            query: ({ page = 1, limit = 10, search = "", educator = "" } = {}) =>
                `/common/recording/admin-recording?page=${page}&limit=${limit}&search=${search}&educator=${educator}`,
        }),

        // Get specific recording by ID
        getAdminRecordingById: builder.query({
            query: (id) => `/common/recording/${id}`,
        }),

        // Get recording by user ID
        getAdminRecordingByUserID: builder.query({
            query: ({ id }) => `/common/recording/${id}`,
        }),

        // Get educator recording by call ID
        getEducatorRecordingByCallID: builder.query({
            query: (callId) => `/common/recording/admin-recording/call/${callId}`,
        }),

        // Create manual recording
        createManualRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recording/manual",
                method: "POST",
                body: data,
            }),
        }),

        // Create admin recording
        createAdminRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recording",
                method: "POST",
                body: data,
            }),
        }),

        // Save educator recording
        saveEducatorRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recording/save",
                method: "POST",
                body: data,
            }),
        }),

        // Update recording
        updateAdminRecording: builder.mutation({
            query: ({ id, ...data } = {}) => ({
                url: `/common/recording/${id}`,
                method: "PUT",
                body: data,
            }),
        }),

        // Delete recording
        deleteAdminRecording: builder.mutation({
            query: (id) => ({
                url: `/common/recording/${id}`,
                method: "DELETE",
            }),
        }),

        // Get educator recordings (for admin view)
        getEducatorRecordings: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) =>
                `/common/educator-recording?page=${page}&limit=${limit}&search=${search}`,
        }),
    }),
});

export const {
    useLazyGetAdminRecordingQuery,
    useGetAdminRecordingByIdQuery,
    useLazyGetAdminRecordingByUserIDQuery,
    useGetEducatorRecordingByCallIDQuery,
    useCreateManualRecordingMutation,
    useCreateAdminRecordingMutation,
    useSaveEducatorRecordingMutation,
    useUpdateAdminRecordingMutation,
    useDeleteAdminRecordingMutation,
    useGetEducatorRecordingsQuery,
} = adminRecordingApiSlice;

