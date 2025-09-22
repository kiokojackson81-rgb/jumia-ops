// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import AdminTopbar from "./_components/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0e13] text-slate-100">
      <AdminTopbar />
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </div>
  );
}
