import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Social Post API Slice
 * 
 * Provides endpoints for managing social posts from the admin/educator perspective.
 * Supports creating, updating, deleting posts with images and videos.
 */
export const adminSocialPostApiSlice = createApi({
    reducerPath: "adminSocialPost",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["SocialPost"],
    endpoints: (builder) => ({
        // Get social posts with pagination and filtering
        // Backend: GET /common/social-post?page=1&limit=10&sortBy=recent&category=<category>
        getPosts: builder.query({
            query: ({ page = 1, limit = 10, sortBy = "recent", category = "" } = {}) => {
                let url = `/common/social-post?page=${page}&limit=${limit}&sortBy=${sortBy}`;
                if (category) {
                    url += `&category=${category}`;
                }
                return url;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "SocialPost", id: _id })),
                        { type: "SocialPost", id: "LIST" },
                    ]
                    : [{ type: "SocialPost", id: "LIST" }],
        }),

        // Create new social post
        // Backend: POST /common/social-post
        // Supports: up to 20 images and 20 videos
        // FormData fields: content, visibility, category, images[], videos[]
        createPost: builder.mutation({
            query: (formData) => ({
                url: "/common/social-post",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "SocialPost", id: "LIST" }],
        }),

        // Update existing social post
        // Backend: PUT /common/social-post/:postId
        // Supports: up to 20 images and 20 videos
        // FormData fields: content, visibility, category, images[], videos[]
        updatePost: builder.mutation({
            query: ({ postId, formData }) => ({
                url: `/common/social-post/${postId}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { postId }) => [
                { type: "SocialPost", id: postId },
                { type: "SocialPost", id: "LIST" },
            ],
        }),

        // Delete social post
        // Backend: DELETE /common/social-post/:id
        deletePost: builder.mutation({
            query: (id) => ({
                url: `/common/social-post/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SocialPost", id },
                { type: "SocialPost", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useLazyGetPostsQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = adminSocialPostApiSlice;
