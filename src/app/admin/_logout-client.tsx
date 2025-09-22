"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: "#111827",
        cursor: "pointer",
      }}
      aria-label="Log out"
      title="Log out"
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
