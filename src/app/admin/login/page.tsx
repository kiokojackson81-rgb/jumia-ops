"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Login failed");
      return;
    }
    router.replace(next);
  }

  return (
    <main style={{ maxWidth: 420, margin: "64px auto", fontFamily: "sans-serif" }}>
      <h1>Admin Login</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          type="password"
          placeholder="Admin password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}
        />
        {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
        <button disabled={loading} style={{ padding: "10px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
