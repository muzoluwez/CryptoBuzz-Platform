import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorStreamScheduleApiSlice = createApi({
    reducerPath: "educatorStreamSchedule",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorStreamSchedule: builder.query({
            query: ({ page = 1, limit = 10, search = "", status = "" }) =>
                `/common/schedule?page=${page}&limit=${limit}&search=${search}&status=${status}`,
        }),
        createEducatorStreamSchedule: builder.mutation({
            query: (data) => ({
                url: "/common/schedule",
                method: "POST",
                body: data,
                formData: true,
            }),
        }),
        updateEducatorStreamSchedule: builder.mutation({
            query: ({ data, id }) => ({
                url: `/common/schedule/${id}`,
                method: "PUT",
                body: data,
                formData: true,
            }),
        }),
        deleteEducatorStreamSchedule: builder.mutation({
            query: (id) => ({
                url: `/common/schedule/${id}`,
                method: "DELETE",
            }),
        }),
        createRecurrenceSchedule: builder.mutation({
            query: (formData) => ({
                url: "/common/schedule/recurrence",
                method: "POST",
                body: formData,
            }),
        }),
        updateRecurrenceSchedule: builder.mutation({
            query: ({ data, id }) => ({
                url: `/common/schedule/recurrence/${id}`,
                method: "PUT",
                body: data,
                formData: true,
            }),
        }),

        createLiveStream: builder.mutation({
            query: (formData) => ({
                url: "/common/schedule/",
                method: "POST",
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetEducatorStreamScheduleQuery,
    useLazyGetEducatorStreamScheduleQuery,
    useCreateEducatorStreamScheduleMutation,
    useUpdateEducatorStreamScheduleMutation,
    useDeleteEducatorStreamScheduleMutation,
    useCreateRecurrenceScheduleMutation,
    useCreateLiveStreamMutation,
    useUpdateRecurrenceScheduleMutation,
} = educatorStreamScheduleApiSlice;
