import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

/**
 * Admin Trade Ideas API Slice
 * 
 * Provides endpoints for managing trade ideas from admin perspective,
 * including viewing client/educator trade ideas and admin management.
 * Also includes /common/idea endpoints for educator-specific operations.
 */
export const educatorTradeIdeasApiSlice = createApi({
    reducerPath: "educatorTradeIdeas",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["TradeIdea", "Idea"],
    endpoints: (builder) => ({


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
                formData: true
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
                formData: true
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
    // Common/Idea endpoints
    useGetIdeaQuery,
    useLazyGetIdeaQuery,
    useGetIdeaListQuery,
    useCreateIdeaMutation,
    useUpdateIdeaMutation,
    useDeleteIdeaMutation,
} = educatorTradeIdeasApiSlice;
