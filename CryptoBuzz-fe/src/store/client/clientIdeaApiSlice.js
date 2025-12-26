import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientIdeaApiSlice = createApi({
  reducerPath: 'clientIdeaApiSlice',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Ideas'],
  endpoints: (builder) => ({
    getIdeas: builder.query({
      query: (params = {}) => {
        const {
          categoryName,
          status,
          ideaType,
          page = 1,
          limit = 10,
          startDate,
          endDate,
        } = params;

        const queryParams = new URLSearchParams();

        if (categoryName) queryParams.append('categoryName', categoryName);
        if (status) queryParams.append('status', status);
        if (ideaType) queryParams.append('ideaType', ideaType);
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const queryString = queryParams.toString();
        return `/users/idea${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Ideas'],
    }),
  }),
});

export const { useGetIdeasQuery, useLazyGetIdeasQuery } = clientIdeaApiSlice;
