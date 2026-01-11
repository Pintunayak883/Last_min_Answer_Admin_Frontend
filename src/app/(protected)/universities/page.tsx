"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import toast from "react-hot-toast";
import {
  createUniversity,
  deleteUniversity,
  getUniversities,
  updateUniversity,
} from "@/lib/api";
import { University } from "@/types/entities";
import { ChevronRight, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<University | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getUniversities();
      setUniversities(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load universities"
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateUniversity(editing.id, values);
        toast.success("University updated");
      } else {
        await createUniversity(values);
        toast.success("University created");
      }
      setModalOpen(false);
      setEditing(null);
      reset();
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  }

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return universities;
    return universities.filter((u) =>
      [u.name, u.code].some((field) => field?.toLowerCase().includes(query))
    );
  }, [search, universities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Universities
          </h1>
          <p className="text-sm text-slate-500">
            Manage university records and codes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Search name or code"
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
            <Plus className="mr-2 h-4 w-4" /> Add University
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="All universities"
          description="Includes course counts"
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
                title="No universities yet"
                description="Create the first university to begin"
                action={
                  <Button onClick={() => setModalOpen(true)}>
                    Create university
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
                      Courses
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rows.map((uni) => (
                    <tr key={uni.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/courses?universityId=${
                            uni.id
                          }&universityName=${encodeURIComponent(uni.name)}`}
                          className="flex items-center gap-2 text-brand-700 hover:text-brand-800 group"
                        >
                          <span>{uni.name}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {uni.code || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {uni._count?.courses ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditing(uni);
                              setModalOpen(true);
                              reset({ name: uni.name, code: uni.code || "" });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={(uni._count?.courses ?? 0) > 0}
                            onClick={() => setConfirmId(uni.id)}
                            title={
                              (uni._count?.courses ?? 0) > 0
                                ? "Cannot delete with courses"
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
        title={editing ? "Edit university" : "Add university"}
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
        title="Delete university"
        description="This action cannot be undone. Courses under this university will block deletion."
        onConfirm={async () => {
          if (!confirmId) return;
          try {
            await deleteUniversity(confirmId);
            toast.success("University deleted");
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
