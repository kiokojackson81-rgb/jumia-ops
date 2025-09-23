// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminTopbar from "./_components/AdminTopbar";

export const metadata: Metadata = {
  title: "Jumia Ops · Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Keep this a SERVER component (no hooks here) to avoid hydration issues.
  return (
    <html lang="en">
      {/* single, stable class value (no client-only switching) */}
      <body className="bg-[#0b0e13] text-slate-100 antialiased">
        <AdminTopbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
