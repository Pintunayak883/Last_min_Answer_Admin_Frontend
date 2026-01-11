"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store/index";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: "0.95rem" } }}
      />
    </Provider>
  );
}
