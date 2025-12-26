import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientEducatorApiSlice = createApi({
    reducerPath: "clientEducator",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAllEducators: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();

                if (params?.search) searchParams.append("search", params.search);
                if (params?.category) searchParams.append("category", params.category);
                if (params?.page) searchParams.append("page", params.page);
                if (params?.limit) searchParams.append("limit", params.limit);

                const queryString = searchParams.toString();
                return `/users/educator${queryString ? `?${queryString}` : ''}`;
            },
        }),
    }),
});

export const {
    useGetAllEducatorsQuery,
} = clientEducatorApiSlice;

