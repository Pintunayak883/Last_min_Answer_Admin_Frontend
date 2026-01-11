"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/spinner";
import { useAuthGuard } from "@/hooks/use-auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checking } = useAuthGuard();

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner size={20} />
          <span className="text-sm font-medium">Validating session...</span>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
