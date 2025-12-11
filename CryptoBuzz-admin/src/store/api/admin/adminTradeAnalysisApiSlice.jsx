import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Analysis API Slice
 * 
 * Provides endpoints for managing trade analysis from admin perspective.
 * Also includes /common/tradeAnalysis endpoints for educator-specific operations.
 */
export const adminTradeAnalysisApiSlice = createApi({
    reducerPath: "adminTradeAnalysis",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["AdminTradeAnalysis", "TradeAnalysis"],
    endpoints: (builder) => ({
        // ==========================================
        // ADMIN ENDPOINTS (/admin/trade-analysis)
        // ==========================================

        // Get admin trade analysis list
        getAdminTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
                `/admin/trade-analysis?page=${page}&limit=${limit}&search=${search}&category=${category}`,
            providesTags: [{ type: "AdminTradeAnalysis", id: "LIST" }],
        }),

        // Create trade analysis (admin)
        createAdminTradeAnalysis: builder.mutation({
            query: (data) => ({
                url: "/admin/trade-analysis",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "AdminTradeAnalysis", id: "LIST" }],
        }),

        // Update trade analysis (admin)
        updateAdminTradeAnalysis: builder.mutation({
            query: ({ id, ...data } = {}) => ({
                url: `/admin/trade-analysis/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "AdminTradeAnalysis", id },
                { type: "AdminTradeAnalysis", id: "LIST" },
            ],
        }),

        // Delete trade analysis (admin)
        deleteAdminTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/admin/trade-analysis/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "AdminTradeAnalysis", id: "LIST" }],
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

        // ==========================================
        // COMMON ENDPOINTS (/common/trade-analysis)
        // ==========================================

        // Get trade analysis with pagination (educator's own analyses)
        // Backend: GET /common/trade-analysis?page=1&limit=10&category=<categoryId>
        getTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10, category = "" } = {}) => {
                let url = `/common/trade-analysis?page=${page}&limit=${limit}`;
                if (category) {
                    url += `&category=${category}`;
                }
                return url;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "TradeAnalysis", id: _id })),
                        { type: "TradeAnalysis", id: "LIST" },
                    ]
                    : [{ type: "TradeAnalysis", id: "LIST" }],
        }),

        // Create new trade analysis
        // Backend: POST /common/trade-analysis (with file upload - up to 3 images)
        createTradeAnalysis: builder.mutation({
            query: (formData) => ({
                url: "/common/trade-analysis",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "TradeAnalysis", id: "LIST" }],
        }),

        // Update existing trade analysis
        // Backend: PUT /common/trade-analysis/:id (with file upload - up to 3 images)
        updateTradeAnalysis: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/common/trade-analysis/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TradeAnalysis", id },
                { type: "TradeAnalysis", id: "LIST" },
            ],
        }),

        // Delete trade analysis
        // Backend: DELETE /common/trade-analysis/:id
        deleteTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/common/trade-analysis/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TradeAnalysis", id },
                { type: "TradeAnalysis", id: "LIST" },
            ],
        }),
    }),
});

export const {
    // Admin endpoints
    useLazyGetAdminTradeAnalysisQuery,
    useCreateAdminTradeAnalysisMutation,
    useUpdateAdminTradeAnalysisMutation,
    useDeleteAdminTradeAnalysisMutation,
    useDeleteEducatorTradeIdeaMutation,
    useDeleteEducatorTradeAnalysisMutation,

    // Common/TradeAnalysis endpoints
    useGetTradeAnalysisQuery,
    useLazyGetTradeAnalysisQuery,
    useCreateTradeAnalysisMutation,
    useUpdateTradeAnalysisMutation,
    useDeleteTradeAnalysisMutation,
} = adminTradeAnalysisApiSlice;
