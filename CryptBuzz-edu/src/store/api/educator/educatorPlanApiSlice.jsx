import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Educator Plan API Slice
 * 
 * Provides endpoints for educators to view payment plans (read-only).
 * Educators can view plans to assign them to courses they create.
 * Integrated with backend routes: /admin/plan (read-only access)
 */
export const educatorPlanApiSlice = createApi({
  reducerPath: "educatorPlan",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Plan"],
  endpoints: (builder) => ({
    // Get all active plans (for dropdowns/selects)
    // Backend: GET /admin/plan?status=active
    // Note: This uses admin endpoint but educators should have read access
    fetchPlans: builder.query({
      query: () => `/admin/plan?status=active`,
      providesTags: [{ type: "Plan", id: "LIST" }],
    }),

    // Get single plan by ID (for viewing plan details)
    // Backend: GET /admin/plan/:id
    getPlan: builder.query({
      query: (id) => `/admin/plan/${id}`,
      providesTags: (result, error, id) => [{ type: "Plan", id }],
    }),
  }),
});

export const {
  useFetchPlansQuery,
  useLazyFetchPlansQuery,
  useGetPlanQuery,
  useLazyGetPlanQuery,
} = educatorPlanApiSlice;
