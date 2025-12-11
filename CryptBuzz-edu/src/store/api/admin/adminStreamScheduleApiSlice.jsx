import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Stream Schedule API Slice
 * 
 * Provides endpoints for managing stream schedules,
 * including creation, updates, deletion, and listing.
 */
export const adminStreamScheduleApiSlice = createApi({
    reducerPath: "adminStreamSchedule",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Get stream schedules with filters
        getAdminStreamSchedule: builder.query({
            query: ({ page = 1,
                limit = 10,
                search = "",
                educator = "",
                status = "",
            } = {}) =>
                `/common/schedule?page=${page}&limit=${limit}&search=${search}&educator=${educator}&status=${status}`,
        }),

        // Create new stream schedule
        createEducatorStreamSchedule: builder.mutation({
            query: (payload) => ({
                url: "/common/schedule/create",
                method: "POST",
                body: payload,
            }),
        }),

        // Update existing stream schedule
        updateEducatorStreamSchedule: builder.mutation({
            query: ({ id, ...payload } = {}) => ({
                url: `/common/schedule/${id}`,
                method: "PUT",
                body: payload,
            }),
        }),

        // Delete stream schedule
        deleteEducatorStreamSchedule: builder.mutation({
            query: (id) => ({
                url: `/common/schedule/${id}`,
                method: "DELETE",
            }),
        }),

        // Create recurrence schedule
        createEducatorRecurrenceSchedule: builder.mutation({
            query: (payload) => ({
                url: "/common/schedule/recurrence",
                method: "POST",
                body: payload,
            }),
        }),

        // Create recurrence schedule (alias)
        createRecurrenceSchedule: builder.mutation({
            query: (payload) => ({
                url: "/common/schedule/recurrence",
                method: "POST",
                body: payload,
            }),
        }),

        // Update recurrence schedule
        updateRecurrenceSchedule: builder.mutation({
            query: ({ id, formData } = {}) => ({
                url: `/common/schedule/recurrence/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
        }),
    }),
});

export const {
    useLazyGetAdminStreamScheduleQuery,
    useCreateEducatorStreamScheduleMutation,
    useUpdateEducatorStreamScheduleMutation,
    useDeleteEducatorStreamScheduleMutation,
    useCreateEducatorRecurrenceScheduleMutation,
    useCreateRecurrenceScheduleMutation,
    useUpdateRecurrenceScheduleMutation,
} = adminStreamScheduleApiSlice;

