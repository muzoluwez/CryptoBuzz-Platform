import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";
import { useGetLanguageQuery } from "./adminLanguagesApiSlice";
import { useLazyGetAdminCoursesTypesQuery } from "./adminCoursesTypesApiSlice";


/**
 * Admin Category API Slice
 * 
 * Provides endpoints for managing categories from the admin perspective.
 * Integrated with backend routes: /admin/category
 */
export const adminAcademyCategoryApiSlice = createApi({
  reducerPath: "adminAcademyCategory",
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

    // Create new category
    // Backend: POST /admin/category
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    // Update existing category
    // Backend: PUT /admin/category/:id
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    // Delete category (soft delete)
    // Backend: DELETE /admin/category/:id
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = adminAcademyCategoryApiSlice;

// Backward compatibility exports for existing components
// These are aliases to the new hook names
export const useLazyGetAdminAcademyCategoryQuery = useLazyGetCategoriesQuery;
export const useGetEducatorAcademyCategoryQuery = useFetchCategoriesQuery;
export const useCreateAdminAcademyCategoryMutation = useCreateCategoryMutation;
export const useUpdateAdminAcademyCategoryMutation = useUpdateCategoryMutation;
export const useDeleteAdminAcademyCategoryMutation = useDeleteCategoryMutation;

// Re-export hooks from other API slices for backward compatibility
// These were previously exported from this slice
export const useGetCoursesTypesQuery = useLazyGetAdminCoursesTypesQuery;
export const useGetLanguageListQuery = useGetLanguageQuery;

