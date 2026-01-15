"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  University,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { clearToken } from "@/lib/token-storage";
import { useAppDispatch } from "@/hooks/use-redux";
import { resetAuth } from "@/store/auth-slice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/universities", label: "Universities", icon: University },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    clearToken();
    dispatch(resetAuth());
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-semibold">
          OA
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">One Answers</p>
          <p className="text-xs text-slate-500">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-50 text-brand-700 border border-brand-100"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to login again to access the admin panel."
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}
