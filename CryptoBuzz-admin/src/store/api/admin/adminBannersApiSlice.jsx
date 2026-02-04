import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Banners API Slice
 * 
 * Provides endpoints for managing platform banners.
 */
export const adminBannersApiSlice = createApi({
    reducerPath: "adminBanners",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // Get all banners (for banner display)
        getBannerList: builder.query({
            query: () => `/admin/banner/list`,
        }),

        // Get banners with pagination and filters
        getBanners: builder.query({
            query: ({ page = 1, limit = 10, search = "", position = "" } = {}) =>
                `/admin/banner?page=${page}&limit=${limit}&search=${search}&position=${position}`,
        }),

        // Create new banner
        createBanner: builder.mutation({
            query: (data) => ({
                url: "/admin/banner/",
                method: "POST",
                body: data,
            }),
        }),

        // Update banner by ID
        updateBanner: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/banner/${id}`,
                method: "PUT",
                body: formData,
            }),
        }),

        // Delete banner by ID
        deleteBanner: builder.mutation({
            query: (id) => ({
                url: `/admin/banner/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetBannerListQuery,
    useGetBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
    useLazyGetBannersQuery,
} = adminBannersApiSlice;
