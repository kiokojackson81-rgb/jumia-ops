// src/app/admin/layout.tsx
import Link from "next/link";
import LogoutClient from "./_logout-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            gap: 12,
          }}
        >
          <Link href="/admin" style={{ textDecoration: "none", color: "#111827" }}>
            <b>Jumia Ops · Admin</b>
          </Link>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <nav style={{ display: "flex", gap: 10 }}>
              <NavLink href="/admin/shops" label="Shops" />
              <NavLink href="/admin/attendants" label="Attendants" />
              <NavLink href="/admin/orders" label="Orders" />
              <NavLink href="/admin/pending" label="Pending Pricing" />
              <NavLink href="/admin/reports" label="Reports" />
            </nav>
            <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
            <LogoutClient />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: "#111827",
        textDecoration: "none",
        fontSize: 14,
      }}
    >
      {label}
    </Link>
  );
}
