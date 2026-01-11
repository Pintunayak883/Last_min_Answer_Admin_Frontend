import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { University, Course, Term, Subject } from "@/types/entities";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["University", "Course", "Term", "Subject"],
  endpoints: (builder) => ({
    // Universities
    getUniversities: builder.query<University[], void>({
      query: () => "/universities",
      providesTags: ["University"],
    }),

    // Courses
    getCoursesByUniversity: builder.query<Course[], string>({
      query: (universityId) => `/courses?universityId=${universityId}`,
      providesTags: ["Course"],
    }),

    // Terms
    getTermsBySession: builder.query<Term[], string>({
      query: (courseId) => `/terms?courseId=${courseId}`,
      providesTags: ["Term"],
    }),

    createTerm: builder.mutation<
      Term,
      {
        courseId: string;
        type: "SEMESTER" | "YEAR";
        value: number;
        label?: string;
      }
    >({
      query: (body) => ({
        url: "/terms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Term"],
    }),

    updateTerm: builder.mutation<
      Term,
      { id: string; value?: number; label?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/terms/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Term"],
    }),

    deleteTerm: builder.mutation<void, string>({
      query: (id) => ({
        url: `/terms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Term"],
    }),

    // Subjects
    getSubjectsByTerm: builder.query<Subject[], string>({
      query: (termId) => `/subjects?termId=${termId}`,
      providesTags: ["Subject"],
    }),

    createSubject: builder.mutation<
      Subject,
      { name: string; code?: string; termId: string }
    >({
      query: (body) => ({
        url: "/subjects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subject"],
    }),

    updateSubject: builder.mutation<
      Subject,
      { id: string; name?: string; code?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/subjects/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subject"],
    }),

    deleteSubject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subject"],
    }),
  }),
});

export const {
  useGetUniversitiesQuery,
  useGetCoursesByUniversityQuery,
  useGetTermsBySessionQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
  useGetSubjectsByTermQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = adminApi;
