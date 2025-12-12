
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLanguageApiSlice = createApi({
    reducerPath: 'educatorLanguageApiSlice',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getLanguages: builder.query({
            query: () => `/admin/language/list`,
        }),

    }),
});

export const { useGetLanguagesQuery } = educatorLanguageApiSlice;  