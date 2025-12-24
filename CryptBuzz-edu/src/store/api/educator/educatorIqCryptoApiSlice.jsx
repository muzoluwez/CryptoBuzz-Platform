import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorIqCryptoApiSlice = createApi({
    reducerPath: "educatorIqCrypto",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorIqCrypto: builder.query({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/common/crypto-analysis/?page=${page}&limit=${limit}`,
        }),
        createEducatorIqCrypto: builder.mutation({
            query: (formData) => ({
                url: "/common/crypto-analysis",
                method: "POST",
                body: formData,
                formData: true,
            }),
        }),
        updateEducatorIqCrypto: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/common/crypto-analysis/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
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
} = educatorIqCryptoApiSlice;
