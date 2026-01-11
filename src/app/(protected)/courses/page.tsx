"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { ChevronRight, Pencil, Plus, Trash, ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const universityId = searchParams.get("universityId") ?? "";
  const universityName = searchParams.get("universityName") ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!universityId) return;
    void load();
  }, [universityId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function load() {
    setLoading(true);
    try {
      const courseData = await getCourses(universityId);
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
        await updateCourse(editing.id, values);
        toast.success("Course updated");
      } else {
        await createCourse({
          ...values,
          universityId,
        });
        toast.success("Course created");
      }
      setModalOpen(false);
      setEditing(null);
      reset({ name: "", code: "" });
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((c) =>
      [c.name, c.code].some((field) => field?.toLowerCase().includes(query))
    );
  }, [courses, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  if (!universityId) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No university selected"
          description="Please select a university to view courses"
          action={
            <Link href="/universities">
              <Button variant="primary">Back to Universities</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/universities"
          className="flex items-center gap-2 text-brand-700 hover:text-brand-800 font-medium w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Universities
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Courses - {universityName}
          </h1>
          <p className="text-sm text-slate-500">
            Manage courses under this university
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", code: "" });
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader title="All courses" description="Includes term counts" />
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
                          href={`/subjects?universityId=${universityId}&universityName=${encodeURIComponent(
                            universityName
                          )}&courseId=${
                            course.id
                          }&courseName=${encodeURIComponent(course.name)}`}
                          className="flex items-center gap-2 text-brand-700 hover:text-brand-800 group"
                        >
                          <span>{course.name}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        title={editing ? "Edit course" : "Add course"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          reset({ name: "", code: "" });
        }}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="code">Code</label>
            <input id="code" {...register("code")} />
            {errors.code ? (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete course"
        description="This action cannot be undone. Subjects under this course will block deletion."
        onConfirm={async () => {
          if (!confirmId) return;
          try {
            await deleteCourse(confirmId);
            toast.success("Course deleted");
            await load();
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Unable to delete");
          } finally {
            setConfirmId(null);
          }
        }}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
