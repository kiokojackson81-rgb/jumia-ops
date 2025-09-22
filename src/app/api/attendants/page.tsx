"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AttendantLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem("attendant_code");
    if (c) router.replace("/attendant/dashboard");
  }, [router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    sessionStorage.setItem("attendant_code", code.trim());
    router.push("/attendant/dashboard");
  }

  return (
    <main style={{ maxWidth: 520, margin: "48px auto", fontFamily: "sans-serif" }}>
      <h1>Attendant Login</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" style={input} />
        <button type="submit" style={btn}>Continue</button>
      </form>
    </main>
  );
}
const input: React.CSSProperties = { padding: "12px 14px", border: "1px solid #ccc", borderRadius: 8 };
const btn: React.CSSProperties = { padding: "12px 14px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
