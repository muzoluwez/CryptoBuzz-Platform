import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientCryptoApiSlice = createApi({
  reducerPath: 'clientCryptoApiSlice',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Crypto'],
  endpoints: (builder) => ({
    getCryptos: builder.query({
      query: (params = {}) => {
        const {
          categoryName,
          page = 1,
          limit = 10,
          startDate,
          endDate,
        } = params;

        const queryParams = new URLSearchParams();

        if (categoryName) queryParams.append('categoryName', categoryName);
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const queryString = queryParams.toString();
        return `/users/crypto${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Crypto'],
    }),
  }),
});

export const { useGetCryptosQuery, useLazyGetCryptosQuery } =
  clientCryptoApiSlice;
