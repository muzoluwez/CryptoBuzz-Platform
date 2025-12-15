import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";


/**
 * Admin Category API Slice
 * 
 * Provides endpoints for managing categories from the admin perspective.
 * Integrated with backend routes: /admin/category
 */
export const educatorAcademyCategoryApiSlice = createApi({
    reducerPath: "educatorAcademyCategory",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Category"],
    endpoints: (builder) => ({
        // Get all categories with pagination and search
        // Backend: GET /admin/category?page=1&limit=10&search=keyword
        getCategories: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) => {
                let url = `/admin/category?page=${page}&limit=${limit}`;
                if (search) {
                    url += `&search=${encodeURIComponent(search)}`;
                }
                return url;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Category", id: _id })),
                        { type: "Category", id: "LIST" },
                    ]
                    : [{ type: "Category", id: "LIST" }],
        }),

        // Get all categories with status true (for dropdowns/selects)
        // Backend: GET /admin/category/list
        fetchCategories: builder.query({
            query: () => `/admin/category/list`,
            providesTags: [{ type: "Category", id: "LIST" }],
        }),

        // Get single category by ID
        // Backend: GET /admin/category/:id
        getOneCategory: builder.query({
            query: (id) => `/admin/category/${id}`,
            providesTags: (result, error, id) => [{ type: "Category", id }],
        }),

        getEducatorCoursesTypes: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) => `/admin/course-type?page=${page}&limit=${limit}&search=${search}`,
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "CourseType", id: _id })),
                        { type: "CourseType", id: "LIST" },
                    ]
                    : [{ type: "CourseType", id: "LIST" }],
        }),

    }),
});

export const {
    useGetCategoriesQuery,
    useLazyGetCategoriesQuery,
    useFetchCategoriesQuery,
    useLazyFetchCategoriesQuery,
    useGetOneCategoryQuery,
    useLazyGetOneCategoryQuery,
    useGetEducatorCoursesTypesQuery,
} = educatorAcademyCategoryApiSlice;



