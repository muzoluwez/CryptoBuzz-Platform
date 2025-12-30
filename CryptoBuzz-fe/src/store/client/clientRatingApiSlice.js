import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientRatingApiSlice = createApi({
  reducerPath: 'clientRatingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Rating'],
  endpoints: (builder) => ({
    rateEducator: builder.mutation({
      query: (ratingData) => ({
        url: '/users/rating',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Rating', 'Educators'],
    }),
  }),
});

export const { useRateEducatorMutation } = clientRatingApiSlice;

