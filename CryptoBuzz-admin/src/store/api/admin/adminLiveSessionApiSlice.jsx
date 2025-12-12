import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Live Session API Slice
 * 
 * Provides endpoints for managing live streaming sessions,
 * including creation, listing, token generation, and session control.
 */
export const adminLiveSessionApiSlice = createApi({
    reducerPath: "adminLiveSession",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Create new live session
        createLiveSession: builder.mutation({
            query: (payload) => ({
                url: "/educator/live-stream/create",
                method: "POST",
                body: payload,
            }),
        }),

        // Get list of live sessions with filters
        getLiveSessionList: builder.query({
            query: ({ page = 1, limit = 10, status = "", search = "", educator = "" } = {}) =>
                `/educator/live-stream/list?page=${page}&limit=${limit}&status=${status}&search=${search}&educator=${educator}`,
        }),

        // Get client token for joining live session
        getClientToken: builder.mutation({
            query: (payload) => ({
                url: "/common/stream/get-token",
                method: "POST",
                body: payload,
            }),
        }),

        // Start a call/session
        startCall: builder.mutation({
            query: (payload) => ({
                url: "/educator/live-stream/start",
                method: "POST",
                body: payload,
            }),
        }),

        // End live session and create recording
        endAndCreate: builder.mutation({
            query: (payload) => ({
                url: "/educator/live-stream/end-and-create",
                method: "POST",
                body: payload,
            }),
        }),

        // End live call/session
        endCall: builder.mutation({
            query: (payload) => ({
                url: "/educator/live-stream/end-and-create",
                method: "POST",
                body: payload,
            }),
        }),
    }),
});

export const {
    useCreateLiveSessionMutation,
    useLazyGetLiveSessionListQuery,
    useGetClientTokenMutation,
    useStartCallMutation,
    useEndAndCreateMutation,
    useEndCallMutation,
} = adminLiveSessionApiSlice;
