// src/app/attendant/layout.tsx
import Link from "next/link";
import HeaderClient from "./_header-client";

export default function AttendantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#fafafa" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <Link href="/attendant" style={{ textDecoration: "none", color: "#111827" }}>
            <b>Jumia Ops · Attendant</b>
          </Link>

          {/* Client header shows code + logout (reads sessionStorage) */}
          <HeaderClient />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>{children}</main>
    </div>
  );
}
