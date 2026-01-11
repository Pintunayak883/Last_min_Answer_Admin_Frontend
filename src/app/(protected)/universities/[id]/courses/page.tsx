"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import {
  createCourse,
  deleteCourse,
  getCourses,
  getUniversities,
  updateCourse,
} from "@/lib/api";
import { Course, University } from "@/types/entities";
import { ArrowLeft, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
  universityId: z.string().min(1, "University is required"),
});

type FormValues = z.infer<typeof schema>;

export default function UniversityCoursesPage() {
  const params = useParams<{ id: string }>();
  const universityId = params.id;
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { universityId },
  });

  useEffect(() => {
    void load();
  }, [universityId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function load() {
    setLoading(true);
    try {
      const [uniData, courseData] = await Promise.all([
        getUniversities(),
        getCourses(universityId),
      ]);
      const currentUni = uniData.find((u) => u.id === universityId);
      setUniversity(currentUni || null);
      setCourses(courseData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateCourse(editing.id, {
          name: values.name,
          code: values.code,
        });
        toast.success("Course updated");
      } else {
        await createCourse(values);
        toast.success("Course created");
      }
      setModalOpen(false);
      setEditing(null);
      reset({ name: "", code: "", universityId });
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteCourse(confirmId);
      toast.success("Course deleted");
      setConfirmId(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((c) =>
      [c.name, c.code].some((field) => field?.toLowerCase().includes(query))
    );
  }, [search, courses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/universities"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            {university?.name || "University"} - Courses
          </h1>
          <p className="text-sm text-slate-500">
            Manage courses for this university
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", code: "", universityId });
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader title="All courses" description="Click to view subjects" />
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No courses yet"
                description="Create the first course to begin"
                action={
                  <Button onClick={() => setModalOpen(true)}>
                    Create course
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Terms
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rows.map((course) => (
                    <tr key={course.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/universities/${universityId}/courses/${course.id}/subjects`}
                          className="text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          {course.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {course.code || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {course._count?.terms ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditing(course);
                              setModalOpen(true);
                              reset({
                                name: course.name,
                                code: course.code || "",
                                universityId,
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={(course._count?.terms ?? 0) > 0}
                            onClick={() => setConfirmId(course.id)}
                            title={
                              (course._count?.terms ?? 0) > 0
                                ? "Cannot delete with terms"
                                : "Delete"
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                <span>
                  Showing {filtered.length === 0 ? 0 : start + 1}-
                  {Math.min(start + rows.length, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Course" : "Create Course"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="e.g., Computer Science"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="code">Course Code</label>
            <input id="code" {...register("code")} placeholder="e.g., CS" />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
          <input type="hidden" {...register("universityId")} />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editing
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Confirm delete"
        description="This will permanently remove the course and all related data."
        onConfirm={handleDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
