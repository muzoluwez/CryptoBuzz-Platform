import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Ideas API Slice
 * 
 * Provides endpoints for managing trade ideas from admin perspective,
 * including viewing client/educator trade ideas and admin management.
 * Also includes /common/idea endpoints for educator-specific operations.
 */
export const adminTradeIdeasApiSlice = createApi({
  reducerPath: "adminTradeIdeas",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TradeIdea", "Idea"],
  endpoints: (builder) => ({
    // ==========================================
    // ADMIN ENDPOINTS (/admin/trade-ideas)
    // ==========================================

    // Get admin trade ideas
    getAdminTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
        `/admin/trade-ideas?page=${page}&limit=${limit}&search=${search}&category=${category}`,
      providesTags: [{ type: "TradeIdea", id: "LIST" }],
    }),

    // Get admin trade ideas without filters
    getAdminWithoutTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/admin/trade-ideas?page=${page}&limit=${limit}`,
      providesTags: [{ type: "TradeIdea", id: "LIST" }],
    }),

    // Get client trade ideas (for admin view)
    getClientTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, search = "", category = "" } = {}) =>
        `/admin/client-trade-ideas?page=${page}&limit=${limit}&search=${search}&category=${category}`,
      providesTags: [{ type: "TradeIdea", id: "CLIENT_LIST" }],
    }),

    // Get common category (for dropdowns)
    getCommonCategory: builder.query({
      query: () => `/admin/category/list`,
    }),

    // Create trade idea (admin)
    createTradeIdeas: builder.mutation({
      query: (data) => ({
        url: "/admin/trade-ideas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "TradeIdea", id: "LIST" }],
    }),

    // Update trade idea (admin)
    updateTradeIdea: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/trade-ideas/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "TradeIdea", id },
        { type: "TradeIdea", id: "LIST" },
      ],
    }),

    // Delete trade idea (admin)
    deleteTradeIdea: builder.mutation({
      query: (id) => ({
        url: `/admin/trade-ideas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TradeIdea", id: "LIST" }],
    }),

    // ==========================================
    // COMMON ENDPOINTS (/common/idea)
    // ==========================================

    // Get ideas with pagination (educator's own ideas)
    // Backend: GET /common/idea/get?page=1&limit=10&category=<categoryId>&isview=true
    getIdea: builder.query({
      query: ({ page = 1, limit = 10, category = "", isview = "true" } = {}) => {
        let url = `/common/idea/get?page=${page}&limit=${limit}&isview=${isview}`;
        if (category) {
          url += `&category=${category}`;
        }
        return url;
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({ type: "Idea", id: _id })),
            { type: "Idea", id: "LIST" },
          ]
          : [{ type: "Idea", id: "LIST" }],
    }),

    // Get ideas list (without pagination, for dropdowns)
    // Backend: GET /common/idea/list
    getIdeaList: builder.query({
      query: () => `/common/idea/list`,
      providesTags: [{ type: "Idea", id: "LIST" }],
    }),

    // Create new idea
    // Backend: POST /common/idea/create (with file upload - up to 3 images)
    createIdea: builder.mutation({
      query: (formData) => ({
        url: "/common/idea/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Idea", id: "LIST" }],
    }),

    // Update existing idea
    // Backend: PUT /common/idea/updated/:id (with file upload - up to 3 images)
    updateIdea: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/common/idea/updated/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Idea", id },
        { type: "Idea", id: "LIST" },
      ],
    }),

    // Delete idea
    // Backend: DELETE /common/idea/remove/:id
    deleteIdea: builder.mutation({
      query: (id) => ({
        url: `/common/idea/remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Idea", id },
        { type: "Idea", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // Admin endpoints
  useLazyGetAdminTradeIdeasQuery,
  useGetAdminWithoutTradeIdeasQuery,
  useGetClientTradeIdeasQuery,
  useGetCommonCategoryQuery,
  useCreateTradeIdeasMutation,
  useUpdateTradeIdeaMutation,
  useDeleteTradeIdeaMutation,

  // Common/Idea endpoints
  useGetIdeaQuery,
  useLazyGetIdeaQuery,
  useGetIdeaListQuery,
  useCreateIdeaMutation,
  useUpdateIdeaMutation,
  useDeleteIdeaMutation,
} = adminTradeIdeasApiSlice;
