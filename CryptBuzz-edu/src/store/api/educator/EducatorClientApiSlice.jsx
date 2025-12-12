import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorClientApiSlice = createApi({
    reducerPath: 'educatorClientApiSlice',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientToken: builder.mutation({

            query: (payload) => ({
                url: '/common/stream/get-token',
                method: 'POST',
                body: payload,
            }),
        }),
        getClientLiveSchedule: builder.query({
            query: (callID) => `/users/schedule/list/${callID}`,
        }),
        getLiveEducatorList: builder.query({
            query: () => `/users/stream/active`,
        }),
    }),
});

export const { useGetClientTokenMutation, useGetClientLiveScheduleQuery, useGetLiveEducatorListQuery } = educatorClientApiSlice;