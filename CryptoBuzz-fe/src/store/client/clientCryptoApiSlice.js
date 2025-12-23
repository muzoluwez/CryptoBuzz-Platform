import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCryptoApiSlice = createApi({
    reducerPath: "clientCryptoApiSlice",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getCrypto: builder.query({
            query: () => "/users/crypto",
            providesTags: ["Crypto"],
        }),
    }),
});

export const { useGetCryptoQuery, useLazyGetCryptoQuery } = clientCryptoApiSlice;