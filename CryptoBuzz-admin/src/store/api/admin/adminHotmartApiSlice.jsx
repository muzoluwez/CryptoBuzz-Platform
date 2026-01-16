import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminHotmartApiSlice = createApi({
    reducerPath: "adminHotmart",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getHotmartProducts: builder.query({
            query: () => "/common/hotmart/products",
        }),
    }),
});

export const { useGetHotmartProductsQuery, useLazyGetHotmartProductsQuery } = adminHotmartApiSlice;
