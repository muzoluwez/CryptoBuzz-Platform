import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCourseProgressApiSlice = createApi({
    reducerPath: "clientCourseProgress",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["CourseProgress"],
    endpoints: (builder) => ({

        // ✅ GET course progress (completed lectures)
        getCourseProgress: builder.query({
            query: (courseId) => `/users/course/course-progress/${courseId}`,
            providesTags: (result, error, courseId) => [
                { type: "CourseProgress", id: courseId },
            ],
        }),

        // MARK lecture as complete
        markLectureComplete: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: "/users/course/course-progress/complete",
                method: "POST",
                body: {
                    courseId,
                    lectureId,
                },
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: "CourseProgress", id: courseId },
            ],
        }),

        // UNDO lecture complete
        undoLectureComplete: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: "/users/course/course-progress/undo",
                method: "POST",
                body: {
                    courseId,
                    lectureId,
                },
            }),
            invalidatesTags: ["CourseProgress"],
        }),

    }),
});

export const {
    useGetCourseProgressQuery,
    useMarkLectureCompleteMutation,
    useUndoLectureCompleteMutation,
} = clientCourseProgressApiSlice;
