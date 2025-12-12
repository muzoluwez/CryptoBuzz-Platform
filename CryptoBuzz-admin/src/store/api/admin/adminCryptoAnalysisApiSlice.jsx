import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminCryptoAnalysisApiSlice = createApi({
  reducerPath: "adminCryptoAnalysis",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminCryptoAnalysis: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/common/crypto-analysis/?page=${page}&limit=${limit}`,
    }),
    createAdminCryptoAnalysis: builder.mutation({
      query: (formData) => ({
        url: "/common/crypto-analysis",
        method: "POST",
        body: formData,
      }),
    }),
    updateAdminCryptoAnalysis: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/common/crypto-analysis/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteAdminCryptoAnalysis: builder.mutation({
      query: (id) => ({
        url: `/common/crypto-analysis/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetAdminCryptoAnalysisQuery,
  useCreateAdminCryptoAnalysisMutation,
  useUpdateAdminCryptoAnalysisMutation,
  useDeleteAdminCryptoAnalysisMutation,
} = adminCryptoAnalysisApiSlice;
