"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/lib/api";
import { clearToken, getStoredToken } from "@/lib/token-storage";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  resetAuth,
  setAdmin,
  setInitialized,
  setToken,
} from "@/store/auth-slice";

export function useAuthGuard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, initialized } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        dispatch(resetAuth());
        setChecking(false);
        router.push("/login");
        return;
      }

      if (!token) dispatch(setToken(storedToken));

      try {
        const profile = await fetchProfile();
        dispatch(setAdmin(profile));
      } catch (error) {
        clearToken();
        dispatch(resetAuth());
        router.push("/login");
      } finally {
        dispatch(setInitialized(true));
        setChecking(false);
      }
    }

    if (!initialized) {
      void verify();
    } else {
      setChecking(false);
    }
  }, [dispatch, initialized, router, token]);

  return { checking };
}

export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const { token, admin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && admin) {
      router.replace("/dashboard");
    }
  }, [admin, router, token]);
}
