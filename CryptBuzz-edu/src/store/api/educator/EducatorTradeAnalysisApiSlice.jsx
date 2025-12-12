import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Analysis API Slice
 * 
 * Provides endpoints for managing trade analysis from admin perspective.
 * Also includes /common/tradeAnalysis endpoints for educator-specific operations.
 */
export const educatorTradeAnalysisApiSlice = createApi({
    reducerPath: "educatorTradeAnalysis",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["TradeAnalysis"],
    endpoints: (builder) => ({

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

    useGetTradeAnalysisQuery,
    useLazyGetTradeAnalysisQuery,
    useCreateTradeAnalysisMutation,
    useUpdateTradeAnalysisMutation,
    useDeleteTradeAnalysisMutation,
} = educatorTradeAnalysisApiSlice;
