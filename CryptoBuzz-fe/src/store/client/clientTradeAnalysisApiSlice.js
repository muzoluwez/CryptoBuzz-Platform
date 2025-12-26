import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientTradeAnalysisApiSlice = createApi({
  reducerPath: 'clientTradeAnalysisApiSlice',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TradeAnalysis'],
  endpoints: (builder) => ({
    getTradeAnalysis: builder.query({
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
        return `/users/insight${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['TradeAnalysis'],
    }),
  }),
});

export const { useGetTradeAnalysisQuery, useLazyGetTradeAnalysisQuery } =
  clientTradeAnalysisApiSlice;
