import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "One Answers Admin",
  description: "Admin dashboard to manage universities, courses, and resources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
