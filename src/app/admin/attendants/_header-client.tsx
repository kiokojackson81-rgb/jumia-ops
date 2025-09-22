"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function HeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const c = sessionStorage.getItem("attendant_code");
    setCode(c);
  }, [pathname]);

  function logout() {
    sessionStorage.removeItem("attendant_code");
    router.replace("/attendant");
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <NavLink href="/attendant/dashboard" label="Pending Orders" />
      {code ? (
        <>
          <span style={{ color: "#6b7280", fontSize: 14 }}>Signed in: <b style={{ color: "#111827" }}>{code}</b></span>
          <button
            onClick={logout}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <NavLink href="/attendant" label="Login" />
      )}
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
