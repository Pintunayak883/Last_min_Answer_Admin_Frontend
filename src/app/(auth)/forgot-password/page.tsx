"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await forgotPassword(values);
      toast.success("OTP sent to email");
      // Redirect to reset password with email in query
      window.location.href = `/reset-password?email=${encodeURIComponent(values.email)}`;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Forgot password
              </h1>
              <p className="text-sm text-slate-500">
                Enter your admin email to receive an OTP.
              </p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-600" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full pl-10 pr-3"
                />
              </div>
              {errors.email ? (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send OTP"}
            </Button>
          </form>
          <div className="text-center">
            <Link href="/login" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
