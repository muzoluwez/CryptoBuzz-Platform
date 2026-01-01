import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorRatingApiSlice = createApi({
    reducerPath: "educatorRatingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Rating", "EducatorRatings"],
    endpoints: (builder) => ({
        getMyRatings: builder.query({
            query: ({
                educatorId,
                page = 1,
                limit = 10,
                search = "",
                sort = "-createdAt",
            }) =>
                `common/rating/my-ratings?educatorId=${educatorId}&page=${page}&limit=${limit}&search=${search}&sort=${sort}`,

            providesTags: ["Rating"],
        }),
    }),
});

export const {
    useLazyGetMyRatingsQuery,
} = educatorRatingApiSlice;
