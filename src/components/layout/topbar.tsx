"use client";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useAppSelector } from "@/hooks/use-redux";

export function Topbar() {
  const admin = useAppSelector((state) => state.auth.admin);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <Breadcrumbs />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Admin
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {admin?.name || ""}
          </p>
          <p className="text-xs text-slate-500">{admin?.email}</p>
        </div>
      </div>
    </header>
  );
}
