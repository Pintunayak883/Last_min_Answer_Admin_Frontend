import api from "@/lib/http";
import { ApiSuccess } from "@/types/api";
import {
  AdminProfile,
  Course,
  Notes,
  QuestionPaper,
  Subject,
  Syllabus,
  University,
  Term,
} from "@/types/entities";

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<ApiSuccess<LoginResponse>>(
    "/admin/login",
    payload
  );
  return data.data;
}

export async function fetchProfile() {
  const { data } = await api.get<ApiSuccess<AdminProfile>>("/admin/profile");
  return data.data;
}

export async function getUniversities() {
  const { data } = await api.get<ApiSuccess<University[]>>("/universities");
  return data.data;
}

export async function createUniversity(payload: {
  name: string;
  code?: string | null;
}) {
  const { data } = await api.post<ApiSuccess<University>>(
    "/universities",
    payload
  );
  return data.data;
}

export async function forgotPassword(payload: { email: string }) {
  const { data } = await api.post<ApiSuccess<null>>(
    "/admin/forgot-password",
    payload
  );
  return data.message;
}

export async function verifyOtp(payload: {
  email: string;
  otp: string;
  purpose?: string;
}) {
  const { data } = await api.post<ApiSuccess<null>>(
    "/admin/verify-otp",
    payload
  );
  return data.message;
}

export async function resetPassword(payload: {
  email: string;
  newPassword: string;
}) {
  const { data } = await api.post<ApiSuccess<null>>(
    "/admin/reset-password",
    payload
  );
  return data.message;
}

export async function updateUniversity(
  id: string,
  payload: { name: string; code?: string | null }
) {
  const { data } = await api.put<ApiSuccess<University>>(
    `/universities/${id}`,
    payload
  );
  return data.data;
}

export async function deleteUniversity(id: string) {
  await api.delete(`/universities/${id}`);
}

export async function getCourses(universityId?: string) {
  const { data } = await api.get<ApiSuccess<Course[]>>("/courses", {
    params: { universityId },
  });
  return data.data;
}

// New: Fetch a single course by id (used for showing scheme type)
export async function getCourse(id: string) {
  const { data } = await api.get<ApiSuccess<Course>>(`/courses/${id}`);
  return data.data;
}

// New: Fetch terms (semester/year) for a course
export async function getTerms(courseId: string) {
  const { data } = await api.get<ApiSuccess<Term[]>>("/terms", {
    params: { courseId },
  });
  return data.data;
}

// Create a term (semester/year) for a course
export async function createTerm(payload: {
  courseId: string;
  type: "SEMESTER" | "YEAR";
  value: number;
  label?: string | null;
}) {
  const { data } = await api.post<ApiSuccess<Term>>("/terms", payload);
  return data.data;
}

export async function createCourse(payload: {
  name: string;
  code?: string | null;
  universityId: string;
}) {
  const { data } = await api.post<ApiSuccess<Course>>("/courses", payload);
  return data.data;
}

export async function updateCourse(
  id: string,
  payload: { name: string; code?: string | null }
) {
  const { data } = await api.put<ApiSuccess<Course>>(`/courses/${id}`, payload);
  return data.data;
}

export async function deleteCourse(id: string) {
  await api.delete(`/courses/${id}`);
}

export async function getSubjects(courseId?: string) {
  if (!courseId) return [];
  const { data } = await api.get<ApiSuccess<Subject[]>>("/subjects", {
    params: { courseId },
  });
  return data.data;
}

// New: Fetch subjects by term (preferred)
export async function getSubjectsByTerm(termId: string) {
  const { data } = await api.get<ApiSuccess<Subject[]>>("/subjects", {
    params: { termId },
  });
  return data.data;
}

export async function createSubject(payload: {
  name: string;
  code?: string | null;
  // Backward compat: previously courseId was used; now termId is required by backend
  termId?: string;
  courseId?: string;
}) {
  const { data } = await api.post<ApiSuccess<Subject>>("/subjects", payload);
  return data.data;
}

export async function updateSubject(
  id: string,
  payload: { name: string; code?: string | null }
) {
  const { data } = await api.put<ApiSuccess<Subject>>(
    `/subjects/${id}`,
    payload
  );
  return data.data;
}

export async function deleteSubject(id: string) {
  await api.delete(`/subjects/${id}`);
}

export async function getSubjectDetail(id: string) {
  const { data } = await api.get<ApiSuccess<Subject>>(`/subjects/${id}`);
  return data.data;
}

export async function uploadSyllabus(payload: {
  subjectId: string;
  year?: number | null;
  file: File;
  onUploadProgress?: (progress: number) => void;
}) {
  const formData = new FormData();
  formData.append("subjectId", payload.subjectId);
  if (payload.year) formData.append("year", String(payload.year));
  formData.append("file", payload.file);
  const { data } = await api.post<ApiSuccess<Syllabus>>("/syllabus", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (payload.onUploadProgress && event.total) {
        payload.onUploadProgress(
          Math.round((event.loaded * 100) / event.total)
        );
      }
    },
  });
  return data.data;
}

export async function deleteSyllabus(id: string) {
  await api.delete(`/syllabus/${id}`);
}

export async function uploadQuestionPaper(payload: {
  subjectId: string;
  year?: number | null;
  month?: string | null;
  file: File;
  onUploadProgress?: (progress: number) => void;
}) {
  const formData = new FormData();
  formData.append("subjectId", payload.subjectId);
  if (payload.year) formData.append("year", String(payload.year));
  if (payload.month) formData.append("month", payload.month);
  formData.append("file", payload.file);
  const { data } = await api.post<ApiSuccess<QuestionPaper>>(
    "/question-papers",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (payload.onUploadProgress && event.total) {
          payload.onUploadProgress(
            Math.round((event.loaded * 100) / event.total)
          );
        }
      },
    }
  );
  return data.data;
}

export async function updateQuestionPaper(
  id: string,
  payload: {
    year?: number | null;
    month?: string | null;
    file?: File | null;
    onUploadProgress?: (progress: number) => void;
  }
) {
  const formData = new FormData();
  if (payload.year) formData.append("year", String(payload.year));
  if (payload.month) formData.append("month", payload.month);
  if (payload.file) formData.append("file", payload.file);
  const { data } = await api.put<ApiSuccess<QuestionPaper>>(
    `/question-papers/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (payload.onUploadProgress && event.total) {
          payload.onUploadProgress(
            Math.round((event.loaded * 100) / event.total)
          );
        }
      },
    }
  );
  return data.data;
}

export async function deleteQuestionPaper(id: string) {
  await api.delete(`/question-papers/${id}`);
}

export async function uploadNotes(payload: {
  subjectId: string;
  unit?: number | null;
  title?: string | null;
  file: File;
  onUploadProgress?: (progress: number) => void;
}) {
  const formData = new FormData();
  formData.append("subjectId", payload.subjectId);
  if (payload.unit !== undefined && payload.unit !== null)
    formData.append("unit", String(payload.unit));
  if (payload.title) formData.append("title", payload.title);
  formData.append("file", payload.file);
  const { data } = await api.post<ApiSuccess<Notes>>("/notes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (payload.onUploadProgress && event.total) {
        payload.onUploadProgress(
          Math.round((event.loaded * 100) / event.total)
        );
      }
    },
  });
  return data.data;
}

export async function updateNotes(
  id: string,
  payload: {
    unit?: number | null;
    title?: string | null;
    file?: File | null;
    onUploadProgress?: (progress: number) => void;
  }
) {
  const formData = new FormData();
  if (payload.unit !== undefined && payload.unit !== null)
    formData.append("unit", String(payload.unit));
  if (payload.title) formData.append("title", payload.title);
  if (payload.file) formData.append("file", payload.file);
  const { data } = await api.put<ApiSuccess<Notes>>(`/notes/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (payload.onUploadProgress && event.total) {
        payload.onUploadProgress(
          Math.round((event.loaded * 100) / event.total)
        );
      }
    },
  });
  return data.data;
}

export async function deleteNotes(id: string) {
  await api.delete(`/notes/${id}`);
}
