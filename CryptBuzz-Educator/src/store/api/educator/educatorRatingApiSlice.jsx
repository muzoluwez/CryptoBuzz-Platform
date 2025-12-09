import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Educator Rating API Slice
 * Handles educator ratings and reviews
 */
export const educatorRatingApiSlice = createApi({
    reducerPath: "educatorRating",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getMyRatings: builder.query({
            query: ({ educatorId, page = 1, limit = 10, search = "", sort = "-createdAt" }) =>
                `/educator/ratings?educatorId=${educatorId}&page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
        }),
    }),
});

export const { useGetMyRatingsQuery } = educatorRatingApiSlice;
