import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Languages API Slice
 * 
 * Provides endpoints for managing platform languages.
 */
export const adminLanguagesApiSlice = createApi({
    reducerPath: "adminLanguages",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Get all languages (for language selector)
        getLanguage: builder.query({
            query: () => `/admin/language/list`,
        }),

        // Get languages with pagination
        getLanguages: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) =>
                `/admin/language?page=${page}&limit=${limit}&search=${search}`,
        }),

        // Create new language
        createLanguage: builder.mutation({
            query: (data) => ({
                url: "/admin/language/",
                method: "POST",
                body: data,
            }),
        }),

        // Update language
        UpdateLanguage: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/language/${updatedTrade.id}`,
                method: "PUT",
                body: updatedTrade,
            }),
        }),

        // Delete language
        deleteLanguage: builder.mutation({
            query: (id) => ({
                url: `/admin/language/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetLanguageQuery,
    useGetLanguagesQuery,
    useCreateLanguageMutation,
    useUpdateLanguageMutation,
    useDeleteLanguageMutation,
    useLazyGetLanguagesQuery,
} = adminLanguagesApiSlice;


