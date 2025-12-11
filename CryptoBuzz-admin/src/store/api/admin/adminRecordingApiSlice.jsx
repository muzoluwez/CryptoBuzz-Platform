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
        getAdminRecordings: builder.query({
            query: ({ page = 1, limit = 10, search = "", educator = "" } = {}) =>
                `/common/recordings?page=${page}&limit=${limit}&search=${search}&educator=${educator}`,
        }),

        // Get specific recording by ID
        getAdminRecordingById: builder.query({
            query: (id) => `/common/recordings/${id}`,
        }),

        // Get recording by user ID
        getAdminRecordingByUserID: builder.query({
            query: (userId) => `/common/recordings/user/${userId}`,
        }),

        // Get educator recording by call ID
        getEducatorRecordingByCallID: builder.query({
            query: (callId) => `/common/recordings/call/${callId}`,
        }),

        // Create manual recording
        createManualRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recordings/manual",
                method: "POST",
                body: data,
            }),
        }),

        // Create admin recording
        createAdminRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recordings",
                method: "POST",
                body: data,
            }),
        }),

        // Save educator recording
        saveEducatorRecording: builder.mutation({
            query: (data) => ({
                url: "/common/recordings/save",
                method: "POST",
                body: data,
            }),
        }),

        // Update recording
        updateAdminRecording: builder.mutation({
            query: ({ id, ...data } = {}) => ({
                url: `/common/recordings/${id}`,
                method: "PUT",
                body: data,
            }),
        }),

        // Delete recording
        deleteAdminRecording: builder.mutation({
            query: (id) => ({
                url: `/common/recordings/${id}`,
                method: "DELETE",
            }),
        }),

        // Get educator recordings (for admin view)
        getEducatorRecordings: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) =>
                `/common/educator-recordings?page=${page}&limit=${limit}&search=${search}`,
        }),
    }),
});

export const {
    useLazyGetAdminRecordingsQuery,
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

