import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Academy Category API Slice
 * 
 * Provides endpoints for managing academy categories, course types,
 * languages, and related educational content from the admin perspective.
 */
export const adminAcademyCategoryApiSlice = createApi({
  reducerPath: "adminAcademyCategory",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Get academy categories with pagination
    getAdminAcademyCategory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/admin/category?page=${page}&limit=${limit}`,
    }),

    // Get all academy categories (for dropdowns/selects)
    getEducatorAcademyCategory: builder.query({
      query: ({ page = 1, limit = 100 } = {}) =>
        `/admin/category?page=${page}&limit=${limit}`,
    }),

    // Get course types list
    getCoursesTypes: builder.query({
      query: () => `/admin/course-type/list`,
    }),

    // Get language list (for language selector)
    getLanguageList: builder.query({
      query: () => `/admin/language/list`,
    }),

    // Create new academy category
    createAdminAcademyCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/category",
        method: "POST",
        body: data,
      }),
    }),

    // Update existing academy category
    updateAdminAcademyCategory: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/category/${id}`,
        method: "PUT",
        body: data,
        formData: true,
      }),
    }),

    // Delete academy category
    deleteAdminAcademyCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/category/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetAdminAcademyCategoryQuery,
  useGetEducatorAcademyCategoryQuery,
  useGetCoursesTypesQuery,
  useGetLanguageListQuery,
  useCreateAdminAcademyCategoryMutation,
  useUpdateAdminAcademyCategoryMutation,
  useDeleteAdminAcademyCategoryMutation,
} = adminAcademyCategoryApiSlice;
