import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeaApiSlice = createApi({
    reducerPath: "clientTradeIdeaApiSlice",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getTradeIdeas: builder.query({
            query: () => "client/trade-ideas",
            providesTags: ["TradeIdeas"],
        }),

    }),
});

export const { useGetTradeIdeasQuery, useLazyGetTradeIdeasQuery } = clientTradeIdeaApiSlice;
