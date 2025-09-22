import Link from "next/link";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "#374151", fontWeight: 500 }}
    >
      {label}
    </Link>
  );
}

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
            <NavLink href="/admin/products" label="Products" />
            <NavLink href="/admin/reports" label="Reports" />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
        {children}
      </main>
    </div>
  );
}
