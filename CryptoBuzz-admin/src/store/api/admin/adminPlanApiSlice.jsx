import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Plan API Slice
 * 
 * Provides endpoints for managing payment plans from the admin perspective.
 * Integrated with backend routes: /admin/plan
 */
export const adminPlanApiSlice = createApi({
  reducerPath: "adminPlan",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Plan"],
  endpoints: (builder) => ({
    // Get all plans with pagination and search
    // Backend: GET /admin/plan?search=keyword&status=active
    getPlans: builder.query({
      query: ({ search = "", status = "" } = {}) => {
        let url = `/admin/plan`;
        const params = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (params.length > 0) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({ type: "Plan", id: _id })),
            { type: "Plan", id: "LIST" },
          ]
          : [{ type: "Plan", id: "LIST" }],
    }),

    // Get all active plans (for dropdowns/selects)
    // Backend: GET /admin/plan?status=active
    fetchPlans: builder.query({
      query: () => `/admin/plan?status=active`,
      providesTags: [{ type: "Plan", id: "LIST" }],
    }),

    // Get single plan by ID
    // Backend: GET /admin/plan/:id
    getPlan: builder.query({
      query: (id) => `/admin/plan/${id}`,
      providesTags: (result, error, id) => [{ type: "Plan", id }],
    }),

    // Get Hotmart products for plan creation
    // Backend: GET /admin/plan/hotmart-products
    getHotmartProducts: builder.query({
      query: () => `/admin/plan/hotmart-products`,
      providesTags: [{ type: "Plan", id: "HOTMART_PRODUCTS" }],
    }),

    // Create new plan
    // Backend: POST /admin/plan
    createPlan: builder.mutation({
      query: (data) => ({
        url: "/admin/plan",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Plan", id: "LIST" }],
    }),

    // Update existing plan
    // Backend: PUT /admin/plan/:id
    updatePlan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/plan/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Plan", id },
        { type: "Plan", id: "LIST" },
      ],
    }),

    // Delete plan (soft delete)
    // Backend: DELETE /admin/plan/:id
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/admin/plan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Plan", id },
        { type: "Plan", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useFetchPlansQuery,
  useLazyFetchPlansQuery,
  useGetPlanQuery,
  useLazyGetPlanQuery,
  useGetHotmartProductsQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = adminPlanApiSlice;
