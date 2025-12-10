import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCoursesApiSlice = createApi({
    reducerPath: "clientCourses",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();

                if (params?.language) searchParams.append("language", params.language);
                if (params?.category) searchParams.append("categoryId", params.category);
                if (params?.page) searchParams.append("page", params.page);
                if (params?.limit) searchParams.append("limit", params.limit);

                const queryString = searchParams.toString();
                return `/users/courses${queryString ? `?${queryString}` : ''}`;
            },
        }),
        getCourseById: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();

                if (params?.language) searchParams.append("language", params.language);

                const queryString = searchParams.toString();
                return `/users/courses/${params.id}${queryString ? `?${queryString}` : ''}`;
            },
        }),
        getCourseLessons: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();

                if (params?.language) searchParams.append("language", params.language);

                const queryString = searchParams.toString();
                return `/users/courses/${params.courseId}/lessons${queryString ? `?${queryString}` : ''}`;
            },
        }),
    }),
});

export const {
    useGetCoursesQuery,
    useGetCourseByIdQuery,
    useGetCourseLessonsQuery,
} = clientCoursesApiSlice;
