// src/app/admin/layout.tsx
import Link from "next/link";

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
          }}
        >
          <Link href="/admin" style={{ textDecoration: "none", color: "#111827" }}>
            <b>Jumia Ops · Admin</b>
          </Link>

          <nav style={{ display: "flex", gap: 10 }}>
            <NavLink href="/admin/shops" label="Shops" />
            <NavLink href="/admin/attendants" label="Attendants" />
            <NavLink href="/admin/pending" label="Pending Pricing" />
            <NavLink href="/admin/reports" label="Reports" />
          </nav>
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
