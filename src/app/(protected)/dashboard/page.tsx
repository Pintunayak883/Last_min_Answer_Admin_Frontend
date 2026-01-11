"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourses, getSubjects, getUniversities } from "@/lib/api";
import {
  GraduationCap,
  Layers,
  University as UniversityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StatTileProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}

function StatTile({ title, value, icon, href }: StatTileProps) {
  return (
    <Link href={href}>
      <Card className="hover:border-brand-200 transition cursor-pointer">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            {icon}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    universities: 0,
    courses: 0,
    subjects: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [universities, courses, subjects] = await Promise.all([
          getUniversities(),
          getCourses(),
          getSubjects(),
        ]);
        setStats({
          universities: universities.length,
          courses: courses.length,
          subjects: subjects.length,
        });
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Click on a card to navigate through the hierarchy
          </p>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            title="Universities"
            value={stats.universities}
            icon={<UniversityIcon className="h-5 w-5" />}
            href="/universities"
          />
          <Card className="opacity-50">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Courses</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stats.courses}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                <GraduationCap className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="opacity-50">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Subjects</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stats.subjects}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
