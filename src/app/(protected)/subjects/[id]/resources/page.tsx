"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  deleteNotes,
  deleteQuestionPaper,
  deleteSyllabus,
  getSubjectDetail,
  uploadNotes,
  uploadQuestionPaper,
  uploadSyllabus,
} from "@/lib/api";
import { Subject } from "@/types/entities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Upload, Trash } from "lucide-react";
import Link from "next/link";

function ensurePdf(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Max file size is 10MB");
  }
}

// Helper to generate full backend URL for file paths
function getFileUrl(filePath: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const serverUrl = baseUrl.replace("/api", "");

  // Normalize Windows backslashes and trim any drive/path prefix before uploads
  const normalized = filePath.replace(/\\/g, "/");
  const idx = normalized.toLowerCase().indexOf("uploads");
  const relative = idx !== -1 ? normalized.substring(idx) : normalized;

  const cleanPath = relative.startsWith("/") ? relative : `/${relative}`;
  return `${serverUrl}${cleanPath}`;
}

export default function SubjectResourcesPage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    type: "syllabus" | "paper" | "notes";
    id: string;
  } | null>(null);
  const [progress, setProgress] = useState<{
    syllabus?: number;
    paper?: number;
    notes?: number;
  }>({});
  const [submitting, setSubmitting] = useState<{
    syllabus?: boolean;
    paper?: boolean;
    notes?: boolean;
  }>({});

  useEffect(() => {
    void load();
  }, [subjectId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getSubjectDetail(subjectId);
      setSubject(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load subject");
    } finally {
      setLoading(false);
    }
  }

  async function handleSyllabusSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File | null;
    const year = formData.get("year")?.toString();
    if (!file) return toast.error("Please choose a PDF");
    try {
      ensurePdf(file);
      setSubmitting((s) => ({ ...s, syllabus: true }));
      await uploadSyllabus({
        subjectId,
        year: year ? Number(year) : undefined,
        file,
        onUploadProgress: (p) => setProgress((pr) => ({ ...pr, syllabus: p })),
      });
      toast.success("Syllabus uploaded");
      form.reset();
      await load();
    } catch (error: any) {
      toast.error(
        error.message || error.response?.data?.message || "Upload failed"
      );
    } finally {
      setSubmitting((s) => ({ ...s, syllabus: false }));
      setProgress((p) => ({ ...p, syllabus: undefined }));
    }
  }

  async function handlePaperSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File | null;
    const year = formData.get("year")?.toString();
    const month = formData.get("month")?.toString();
    if (!file) return toast.error("Please choose a PDF");
    try {
      ensurePdf(file);
      setSubmitting((s) => ({ ...s, paper: true }));
      await uploadQuestionPaper({
        subjectId,
        year: year ? Number(year) : undefined,
        month: month || undefined,
        file,
        onUploadProgress: (p) => setProgress((pr) => ({ ...pr, paper: p })),
      });
      toast.success("Question paper uploaded");
      form.reset();
      await load();
    } catch (error: any) {
      toast.error(
        error.message || error.response?.data?.message || "Upload failed"
      );
    } finally {
      setSubmitting((s) => ({ ...s, paper: false }));
      setProgress((p) => ({ ...p, paper: undefined }));
    }
  }

  async function handleNotesSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File | null;
    const unit = formData.get("unit")?.toString();
    const title = formData.get("title")?.toString();
    if (!file) return toast.error("Please choose a PDF");
    try {
      ensurePdf(file);
      setSubmitting((s) => ({ ...s, notes: true }));
      await uploadNotes({
        subjectId,
        unit: unit ? Number(unit) : undefined,
        title: title || undefined,
        file,
        onUploadProgress: (p) => setProgress((pr) => ({ ...pr, notes: p })),
      });
      toast.success("Notes uploaded");
      form.reset();
      await load();
    } catch (error: any) {
      toast.error(
        error.message || error.response?.data?.message || "Upload failed"
      );
    } finally {
      setSubmitting((s) => ({ ...s, notes: false }));
      setProgress((p) => ({ ...p, notes: undefined }));
    }
  }

  async function handleDelete() {
    if (!confirm) return;
    try {
      if (confirm.type === "syllabus") await deleteSyllabus(confirm.id);
      if (confirm.type === "paper") await deleteQuestionPaper(confirm.id);
      if (confirm.type === "notes") await deleteNotes(confirm.id);
      toast.success("Deleted successfully");
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setConfirm(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!subject) {
    return (
      <EmptyState
        title="Subject not found"
        description="The subject could not be loaded"
      />
    );
  }

  const course = subject.term?.course;
  const courseId = subject.term?.courseId ?? "";
  const courseName = course?.name ?? "";
  const universityId = course?.universityId ?? "";
  const universityName = course?.university?.name ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {subject.name} resources
          </h1>
          <p className="text-sm text-slate-500">
            Upload syllabus, question papers, and notes (PDF, max 10MB)
          </p>
          <p className="text-xs text-slate-500">
            Course: {courseName || "—"} · University: {universityName || "—"}
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link
            href={`/subjects?courseId=${courseId}&courseName=${encodeURIComponent(
              courseName
            )}&universityId=${universityId}&universityName=${encodeURIComponent(
              universityName
            )}`}
          >
            Back to subjects
          </Link>
        </Button>
      </div>

      {/* Syllabus */}
      <Card>
        <CardHeader
          title="Syllabus"
          description="Single syllabus per subject"
          actions={
            <span className="text-xs text-slate-500">PDF only · Max 10MB</span>
          }
        />
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-3"
            onSubmit={handleSyllabusSubmit}
          >
            <div className="sm:col-span-1 space-y-2">
              <label htmlFor="syllabus-year">Year (optional)</label>
              <input
                id="syllabus-year"
                name="year"
                type="number"
                min={1900}
                max={2100}
              />
            </div>
            <div className="sm:col-span-1 space-y-2">
              <label htmlFor="syllabus-file">PDF file</label>
              <input
                id="syllabus-file"
                name="file"
                type="file"
                accept="application/pdf"
              />
            </div>
            <div className="sm:col-span-1 flex items-end justify-end gap-2">
              {progress.syllabus ? (
                <span className="text-sm text-slate-500">
                  {progress.syllabus}%
                </span>
              ) : null}
              <Button type="submit" disabled={submitting.syllabus}>
                <Upload className="mr-2 h-4 w-4" />
                {submitting.syllabus
                  ? "Uploading..."
                  : subject.syllabus
                  ? "Replace"
                  : "Upload"}
              </Button>
            </div>
          </form>
          {subject.syllabus ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-800">Syllabus</p>
                <p className="text-slate-500">
                  Year: {subject.syllabus.year || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <a
                    href={getFileUrl(subject.syllabus.filePath)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setConfirm({ type: "syllabus", id: subject.syllabus!.id })
                  }
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No syllabus uploaded"
              description="Upload the latest syllabus PDF"
            />
          )}
        </CardContent>
      </Card>

      {/* Question papers */}
      <Card>
        <CardHeader
          title="Question Papers"
          description="Multiple per subject"
        />
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={handlePaperSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="paper-year">Year</label>
              <input
                id="paper-year"
                name="year"
                type="number"
                min={2000}
                max={2100}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="paper-month">Month (optional)</label>
              <select id="paper-month" name="month" className="w-full">
                <option value="">Select month</option>
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="paper-file">PDF file</label>
              <input
                id="paper-file"
                name="file"
                type="file"
                accept="application/pdf"
                required
              />
            </div>
            <div className="flex items-end justify-end gap-2">
              {progress.paper ? (
                <span className="text-sm text-slate-500">
                  {progress.paper}%
                </span>
              ) : null}
              <Button type="submit" disabled={submitting.paper}>
                <Upload className="mr-2 h-4 w-4" />
                {submitting.paper ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
          {subject.questionPapers && subject.questionPapers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Year
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Month
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      File
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {subject.questionPapers.map((paper) => (
                    <tr key={paper.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {paper.year || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {paper.month || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <a
                          className="text-brand-700"
                          href={getFileUrl(paper.filePath)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setConfirm({ type: "paper", id: paper.id })
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No question papers"
              description="Upload previous papers for this subject"
            />
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader
          title="Notes"
          description="Upload notes per unit with title"
        />
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={handleNotesSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="notes-unit">Unit (optional)</label>
              <input
                id="notes-unit"
                name="unit"
                type="number"
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="notes-title">Title (optional)</label>
              <input
                id="notes-title"
                name="title"
                placeholder="e.g., Unit 1 overview"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes-file">PDF file</label>
              <input
                id="notes-file"
                name="file"
                type="file"
                accept="application/pdf"
                required
              />
            </div>
            <div className="sm:col-span-4 flex items-end justify-end gap-2">
              {progress.notes ? (
                <span className="text-sm text-slate-500">
                  {progress.notes}%
                </span>
              ) : null}
              <Button type="submit" disabled={submitting.notes}>
                <Upload className="mr-2 h-4 w-4" />
                {submitting.notes ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
          {subject.notes && subject.notes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      File
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {subject.notes.map((note) => (
                    <tr key={note.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {note.unit || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {note.title || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <a
                          className="text-brand-700"
                          href={getFileUrl(note.filePath)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setConfirm({ type: "notes", id: note.id })
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No notes"
              description="Upload PDF notes per unit"
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Confirm delete"
        description="This will permanently remove the file from storage."
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
