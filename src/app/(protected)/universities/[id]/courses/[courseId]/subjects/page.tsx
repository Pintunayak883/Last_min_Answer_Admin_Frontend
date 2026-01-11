"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import {
  createSubject,
  deleteSubject,
  getCourses,
  getSubjects,
  updateSubject,
} from "@/lib/api";
import { Course, Subject } from "@/types/entities";
import { ArrowLeft, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
});

type FormValues = z.infer<typeof schema>;

export default function CourseSubjectsPage() {
  const params = useParams<{ id: string; courseId: string }>();
  const { id: universityId, courseId } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Subject | null>(null);
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
    defaultValues: { courseId },
  });

  useEffect(() => {
    void load();
  }, [courseId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function load() {
    setLoading(true);
    try {
      const [courseData, subjectData] = await Promise.all([
        getCourses(),
        getSubjects(courseId),
      ]);
      const currentCourse = courseData.find((c) => c.id === courseId);
      setCourse(currentCourse || null);
      setSubjects(subjectData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateSubject(editing.id, {
          name: values.name,
          code: values.code,
        });
        toast.success("Subject updated");
      } else {
        await createSubject(values);
        toast.success("Subject created");
      }
      setModalOpen(false);
      setEditing(null);
      reset({ name: "", code: "", courseId });
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteSubject(confirmId);
      toast.success("Subject deleted");
      setConfirmId(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((s) =>
      [s.name, s.code].some((field) => field?.toLowerCase().includes(query))
    );
  }, [search, subjects]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/universities/${universityId}/courses`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            {course?.name || "Course"} - Subjects
          </h1>
          <p className="text-sm text-slate-500">
            Manage subjects for this course
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", code: "", courseId });
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader
          title="All subjects"
          description="Click to manage resources"
        />
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
                title="No subjects yet"
                description="Create the first subject to begin"
                action={
                  <Button onClick={() => setModalOpen(true)}>
                    Create subject
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
                      Resources
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rows.map((subject) => {
                    const resourceCount =
                      (subject.syllabus ? 1 : 0) +
                      (subject._count?.questionPapers ?? 0) +
                      (subject._count?.notes ?? 0);
                    return (
                      <tr key={subject.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <Link
                            href={`/universities/${universityId}/courses/${courseId}/subjects/${subject.id}/resources`}
                            className="text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            {subject.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {subject.code || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {resourceCount} file{resourceCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditing(subject);
                                setModalOpen(true);
                                reset({
                                  name: subject.name,
                                  code: subject.code || "",
                                  courseId,
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={resourceCount > 0}
                              onClick={() => setConfirmId(subject.id)}
                              title={
                                resourceCount > 0
                                  ? "Cannot delete with resources"
                                  : "Delete"
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        title={editing ? "Edit Subject" : "Create Subject"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="e.g., Data Structures"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="code">Subject Code</label>
            <input id="code" {...register("code")} placeholder="e.g., DS101" />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
          <input type="hidden" {...register("courseId")} />
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
                ? "Update Subject"
                : "Create Subject"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Confirm delete"
        description="This will permanently remove the subject and all related resources."
        onConfirm={handleDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
