"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  universities: "Universities",
  courses: "Courses",
  subjects: "Subjects",
  resources: "Resources",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="hover:text-slate-700">
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const label = labelMap[segment] || segment;
          const isLast = index === segments.length - 1;
          return (
            <li key={href} className="flex items-center gap-2">
              <span className="text-slate-300">/</span>
              {isLast ? (
                <span className="font-semibold text-slate-700">{label}</span>
              ) : (
                <Link href={href} className={clsx("hover:text-slate-700")}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
