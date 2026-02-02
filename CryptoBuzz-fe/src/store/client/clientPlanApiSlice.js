import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientPlanApiSlice = createApi({
  reducerPath: 'clientPlanApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Plan'],
  endpoints: (builder) => ({
    // Fetch active plans (public listing)
    fetchPlans: builder.query({
      query: () => `/common/plan/public?status=active`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Plan', id: _id })),
              { type: 'Plan', id: 'LIST' },
            ]
          : [{ type: 'Plan', id: 'LIST' }],
    }),
    getPlan: builder.query({
      query: (id) => `/admin/plan/${id}`,
      providesTags: (result, error, id) => [{ type: 'Plan', id }],
    }),
  }),
});

export const { useFetchPlansQuery, useGetPlanQuery, useLazyFetchPlansQuery } = clientPlanApiSlice;
