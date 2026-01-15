import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Purchase API Slice
 * 
 * Provides endpoints for managing course purchases from the admin perspective.
 * Integrated with backend routes: /admin/purchase
 */
export const adminPurchaseApiSlice = createApi({
  reducerPath: "adminPurchase",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    // Get all purchases with pagination and filters
    // Backend: GET /admin/purchase?status=approved&page=1&limit=50&search=email
    getPurchases: builder.query({
      query: ({ 
        status = "", 
        courseId = "", 
        userId = "", 
        startDate = "", 
        endDate = "", 
        search = "",
        page = 1,
        limit = 50
      } = {}) => {
        let url = `/admin/purchase`;
        const params = [];
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (courseId) params.push(`courseId=${encodeURIComponent(courseId)}`);
        if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
        if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
        if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        if (params.length > 0) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: (result) =>
        result?.data?.purchases
          ? [
            ...result.data.purchases.map(({ _id }) => ({ type: "Purchase", id: _id })),
            { type: "Purchase", id: "LIST" },
          ]
          : [{ type: "Purchase", id: "LIST" }],
    }),

    // Get single purchase by ID
    // Backend: GET /admin/purchase/:id
    getPurchase: builder.query({
      query: (id) => `/admin/purchase/${id}`,
      providesTags: (result, error, id) => [{ type: "Purchase", id }],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useLazyGetPurchasesQuery,
  useGetPurchaseQuery,
  useLazyGetPurchaseQuery,
} = adminPurchaseApiSlice;
