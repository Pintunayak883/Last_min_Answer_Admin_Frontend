"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  getSubjectsByTerm,
  updateSubject,
  getCourse,
  getTerms,
  createTerm,
} from "@/lib/api";
import { Subject, Course, Term } from "@/types/entities";
import { ChevronRight, Pencil, Plus, Trash, ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
  termId: z.string().min(1, "Term is required"),
});

type FormValues = z.infer<typeof schema>;

export default function SubjectsPage() {
  const searchParams = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const [newTermValue, setNewTermValue] = useState<number>(1);
  const [newTermLabel, setNewTermLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const courseId = searchParams.get("courseId") ?? "";
  const courseName = searchParams.get("courseName") ?? "";
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

  // Load course and terms
  useEffect(() => {
    if (!courseId) return;
    void loadCourseAndTerms();
  }, [courseId]);

  // Load subjects when term is selected
  useEffect(() => {
    if (!selectedTermId) return;
    void loadSubjects();
  }, [selectedTermId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function loadCourseAndTerms() {
    setTermsLoading(true);
    try {
      const courseData = await getCourse(courseId);
      setCourse(courseData);

      const termsData = await getTerms(courseId);
      setTerms(termsData);

      if (termsData.length > 0) {
        setSelectedTermId(termsData[0].id);
        setNewTermValue(termsData.length + 1);
      } else {
        setNewTermValue(1);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load course data"
      );
    } finally {
      setTermsLoading(false);
    }
  }

  async function loadSubjects() {
    setLoading(true);
    try {
      const subjectData = await getSubjectsByTerm(selectedTermId!);
      setSubjects(subjectData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function onCreateTerm() {
    if (!course) return;
    try {
      const term = await createTerm({
        courseId: course.id,
        type: course.schemeType ?? "SEMESTER",
        value: newTermValue,
        label: newTermLabel || undefined,
      });
      toast.success(`${term.label} created`);
      setTermModalOpen(false);
      setNewTermLabel("");
      await loadCourseAndTerms();
      setSelectedTermId(term.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create term");
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateSubject(editing.id, values);
        toast.success("Subject updated");
      } else {
        await createSubject({
          name: values.name,
          code: values.code,
          termId: values.termId,
        });
        toast.success("Subject created");
      }
      setModalOpen(false);
      setEditing(null);
      reset({ name: "", code: "", termId: "" });
      await loadSubjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
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

  if (!courseId) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No course selected"
          description="Please select a course to view subjects"
          action={
            <Link href="/universities">
              <Button variant="primary">Back to Universities</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const backLink = universityId
    ? `/courses?universityId=${universityId}&universityName=${encodeURIComponent(
        universityName
      )}`
    : "/courses";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          href={backLink}
          className="flex items-center gap-2 text-brand-700 hover:text-brand-800 font-medium w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Subjects - {courseName}
          </h1>
          <p className="text-sm text-slate-500">
            Manage subjects under this course
          </p>
        </div>
      </div>

      {/* Term Selector */}
      {termsLoading ? (
        <Skeleton className="h-12" />
      ) : terms.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <EmptyState
            title="No terms available"
            description="Please create terms for this course first"
            action={
              <Button onClick={() => setTermModalOpen(true)}>
                Add {course?.schemeType === "SEMESTER" ? "Semester" : "Year"}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Select {course?.schemeType === "SEMESTER" ? "Semester" : "Year"}
          </label>
          <div className="flex flex-wrap gap-2">
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedTermId(term.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTermId === term.id
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {term.label}
              </button>
            ))}
            <Button
              variant="secondary"
              onClick={() => setTermModalOpen(true)}
              className="ml-auto"
            >
              + Add {course?.schemeType === "SEMESTER" ? "Semester" : "Year"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", code: "", termId: selectedTermId || "" });
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader
          title="All subjects"
          description="Includes resource counts"
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
                  {rows.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/subjects/${subject.id}/resources`}
                          className="flex items-center gap-2 text-brand-700 hover:text-brand-800 group"
                        >
                          <span>{subject.name}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {subject.code || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {(subject._count?.syllabus ?? 0) +
                          (subject._count?.questionPapers ?? 0) +
                          (subject._count?.notes ?? 0)}
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
                                termId: subject.termId || "",
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              (subject._count?.syllabus ?? 0) +
                                (subject._count?.questionPapers ?? 0) +
                                (subject._count?.notes ?? 0) >
                              0
                            }
                            onClick={() => setConfirmId(subject.id)}
                            title={
                              (subject._count?.syllabus ?? 0) +
                                (subject._count?.questionPapers ?? 0) +
                                (subject._count?.notes ?? 0) >
                              0
                                ? "Cannot delete with resources"
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

      {/* Create Term Modal */}
      <Modal
        title={`Add ${course?.schemeType === "SEMESTER" ? "Semester" : "Year"}`}
        open={termModalOpen}
        onClose={() => {
          setTermModalOpen(false);
          setNewTermLabel("");
        }}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setTermModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreateTerm}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {course?.schemeType === "SEMESTER"
                ? "Semester number"
                : "Year number"}
            </label>
            <input
              type="number"
              min={1}
              max={course?.schemeType === "SEMESTER" ? 8 : 4}
              value={newTermValue}
              onChange={(e) => setNewTermValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Optional label</label>
            <input
              placeholder={
                course?.schemeType === "SEMESTER"
                  ? `Semester ${newTermValue}`
                  : `Year ${newTermValue}`
              }
              value={newTermLabel}
              onChange={(e) => setNewTermLabel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={editing ? "Edit subject" : "Add subject"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          reset({ name: "", code: "", termId: "" });
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
          {!editing && (
            <div className="space-y-2">
              <label htmlFor="termId" className="block text-sm font-medium">
                {course?.schemeType === "SEMESTER" ? "Semester" : "Year"}
              </label>
              <select
                id="termId"
                {...register("termId")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="">Select a term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.label}
                  </option>
                ))}
              </select>
              {errors.termId ? (
                <p className="text-sm text-red-600">{errors.termId.message}</p>
              ) : null}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              {...register("name")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
            {errors.name ? (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium">
              Code
            </label>
            <input
              id="code"
              {...register("code")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
            {errors.code ? (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete subject"
        description="This action cannot be undone. Resources under this subject will block deletion."
        onConfirm={async () => {
          if (!confirmId) return;
          try {
            await deleteSubject(confirmId);
            toast.success("Subject deleted");
            await loadSubjects();
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
