import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../apiSlice';

export const clientLanguageApiSlice = createApi({
    reducerPath: 'clientLanguageApiSlice',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Language'],
    endpoints: (builder) => ({
        getLanguages: builder.query({
            query: () => '/users/language',
            providesTags: ['Language'],
        }),
    }),
});

export const { useGetLanguagesQuery, useLazyGetLanguagesQuery } =
    clientLanguageApiSlice;
