import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeAnalysisApiSlice = createApi({
    reducerPath: "clientTradeAnalysisApiSlice",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getTradeAnalysis: builder.query({
            query: () => "/users/insights",
            providesTags: ["TradeAnalysis"],
        }),
    }),
});

export const { useGetTradeAnalysisQuery, useLazyGetTradeAnalysisQuery } = clientTradeAnalysisApiSlice;