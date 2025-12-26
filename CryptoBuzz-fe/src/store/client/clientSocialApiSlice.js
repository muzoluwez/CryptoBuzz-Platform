import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientSocialApiSlice = createApi({
  reducerPath: 'clientSocialApiSlice',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Social'],
  endpoints: (builder) => ({
    getSocials: builder.query({
      query: (params = {}) => {
        const { category, page = 1, limit = 10 } = params;

        const queryParams = new URLSearchParams();

        if (category) queryParams.append('category', category);
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);

        const queryString = queryParams.toString();
        return `/users/social${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Social'],
    }),
  }),
});

export const { useGetSocialsQuery, useLazyGetSocialsQuery } =
  clientSocialApiSlice;
