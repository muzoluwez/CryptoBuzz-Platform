import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Ideas API Slice
 * 
 * Provides endpoints for managing trade ideas from admin perspective,
 * including viewing client/educator trade ideas and admin management.
 */
export const adminTradeIdeasApiSlice = createApi({
  reducerPath: "adminTradeIdeas",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Get admin trade ideas
    getAdminTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
        `/admin/trade-ideas?page=${page}&limit=${limit}&search=${search}&category=${category}`,
    }),

    // Get admin trade ideas without filters
    getAdminWithoutTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/admin/trade-ideas?page=${page}&limit=${limit}`,
    }),

    // Get client trade ideas (for admin view)
    getClientTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
        `/admin/client-trade-ideas?page=${page}&limit=${limit}&search=${search}&category=${category}`,
    }),

    // Get common category (for dropdowns)
    getCommonCategory: builder.query({
      query: () => `/admin/common-category`,
    }),

    // Create trade idea
    createTradeIdeas: builder.mutation({
      query: (data) => ({
        url: "/admin/trade-ideas",
        method: "POST",
        body: data,
      }),
    }),

    // Update trade idea
    updateTradeIdea: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/trade-ideas/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // Delete trade idea
    deleteTradeIdea: builder.mutation({
      query: (id) => ({
        url: `/admin/trade-ideas/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetAdminTradeIdeasQuery,
  useGetAdminWithoutTradeIdeasQuery,
  useGetClientTradeIdeasQuery,
  useGetCommonCategoryQuery,
  useCreateTradeIdeasMutation,
  useUpdateTradeIdeaMutation,
  useDeleteTradeIdeaMutation,
} = adminTradeIdeasApiSlice;
