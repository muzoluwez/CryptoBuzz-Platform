import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const EducatorIqCryptoApiSlice = createApi({
    reducerPath: "educatorIqCrypto",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorIqCrypto: builder.query({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/common/crypto-analysis/?page=${page}&limit=${limit}`,
        }),
        createEducatorIqCrypto: builder.mutation({
            query: (payload) => ({
                url: "/common/crypto-analysis",
                method: "POST",
                body: payload,
            }),
        }),
        updateEducatorIqCrypto: builder.mutation({
            query: ({ id, ...payload }) => ({
                url: `/common/crypto-analysis/${id}`,
                method: "PUT",
                body: payload,
            }),
        }),
        deleteEducatorIqCrypto: builder.mutation({
            query: (id) => ({
                url: `/common/crypto-analysis/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useLazyGetEducatorIqCryptoQuery,
    useCreateEducatorIqCryptoMutation,
    useUpdateEducatorIqCryptoMutation,
    useDeleteEducatorIqCryptoMutation,
} = EducatorIqCryptoApiSlice;
