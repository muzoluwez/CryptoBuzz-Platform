import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientScheduleApiSlice = createApi({
  reducerPath: 'clientScheduleApiSlice',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Schedule'],
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: (params = {}) => {
        const { categoryId, language, startDate, endDate } = params;

        const queryParams = new URLSearchParams();

        if (categoryId) queryParams.append('categoryId', categoryId);
        if (language) queryParams.append('language', language);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const queryString = queryParams.toString();
        return `/users/schedule${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Schedule'],
    }),
    getToken: builder.mutation({
      query: (payload) => ({
        url: '/users/schedule/get-token',
        method: 'POST',
        body: payload,
      }),
    }),
    getActiveLiveStreamByEducator: builder.query({
      query: (educatorId) => `/users/schedule/educator/${educatorId}/active-live`,
      providesTags: ['Schedule'],
    }),
    getAllActiveLiveStreams: builder.query({
      query: () => `/users/schedule/active-live-streams`,
      providesTags: ['Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useLazyGetScheduleQuery,
  useGetTokenMutation,
  useGetActiveLiveStreamByEducatorQuery,
  useGetAllActiveLiveStreamsQuery,
} = clientScheduleApiSlice;
