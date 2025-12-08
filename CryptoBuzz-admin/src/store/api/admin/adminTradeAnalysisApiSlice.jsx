import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Analysis API Slice
 * 
 * Provides endpoints for managing trade analysis from admin perspective.
 */
export const adminTradeAnalysisApiSlice = createApi({
    reducerPath: "adminTradeAnalysis",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Get admin trade analysis list
        getAdminTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
                `/admin/trade-analysis?page=${page}&limit=${limit}&search=${search}&category=${category}`,
        }),

        // Create trade analysis
        createAdminTradeAnalysis: builder.mutation({
            query: (data) => ({
                url: "/admin/trade-analysis",
                method: "POST",
                body: data,
            }),
        }),

        // Update trade analysis
        updateAdminTradeAnalysis: builder.mutation({
            query: ({ id, ...data } = {}) => ({
                url: `/admin/trade-analysis/${id}`,
                method: "PUT",
                body: data,
            }),
        }),

        // Delete trade analysis
        deleteAdminTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/admin/trade-analysis/${id}`,
                method: "DELETE",
            }),
        }),

        // Delete educator trade idea (admin managing educator content)
        deleteEducatorTradeIdea: builder.mutation({
            query: (id) => ({
                url: `/admin/educator-trade-idea/${id}`,
                method: "DELETE",
            }),
        }),

        // Delete educator trade analysis (admin managing educator content)
        deleteEducatorTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/admin/educator-trade-analysis/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useLazyGetAdminTradeAnalysisQuery,
    useCreateAdminTradeAnalysisMutation,
    useUpdateAdminTradeAnalysisMutation,
    useDeleteAdminTradeAnalysisMutation,
    useDeleteEducatorTradeIdeaMutation,
    useDeleteEducatorTradeAnalysisMutation,
} = adminTradeAnalysisApiSlice;



