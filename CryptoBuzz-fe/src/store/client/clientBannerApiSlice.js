import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientBannerApiSlice = createApi({
    reducerPath: 'clientBannerApiSlice',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Banner'],
    endpoints: (builder) => ({
        getBanners: builder.query({
            query: () => '/admin/banner/list',
            providesTags: ['Banner'],
        }),
    }),
});

export const { useGetBannersQuery, useLazyGetBannersQuery } =
    clientBannerApiSlice;
