import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorCoursesApiSlice = createApi({
    reducerPath: 'educatorCourses',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorCourses: builder.query({
            query: ({ page = 1, limit = 10, category = "" }) => `/educator/course?page=${page}&limit=${limit}&category=${category}`,
        }),
        createEducatorCourse: builder.mutation({
            query: (data) => ({
                url: '/educator/course',
                method: 'POST',
                body: data,
                formData: true // Assuming file uploads (thumbnails, etc.)
            }),
        }),
        updateEducatorCourse: builder.mutation({
            query: (updatedData) => ({
                url: `/educator/course/${updatedData.get("id")}`,
                method: 'PUT',
                body: updatedData,
                formData: true
            }),
        }),
        deleteEducatorCourse: builder.mutation({
            query: (id) => ({
                url: `/educator/course/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetEducatorCoursesQuery,
    useCreateEducatorCourseMutation,
    useUpdateEducatorCourseMutation,
    useDeleteEducatorCourseMutation
} = educatorCoursesApiSlice;
