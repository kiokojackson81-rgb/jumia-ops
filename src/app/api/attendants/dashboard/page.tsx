"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: number;
  externalOrderId: string;
  shopName: string;
  productName: string;
  quantity: number;
  sellingPricePerUnit: number | null;
  buyingPricePerUnit: number | null;
  jumiaProductUrl: string;
};

export default function AttendantDashboard() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = sessionStorage.getItem("attendant_code");
    if (!c) { router.replace("/attendant"); return; }
    setCode(c);
  }, [router]);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/attendant/orders?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, [code]);

  async function savePrice(id: number, price: number) {
    setSaving(id);
    try {
      const r = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyingPricePerUnit: price }),
      });
      if (!r.ok) throw new Error("save failed");
      setRows(prev => prev.filter(x => x.id !== id)); // remove from pending
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  function logout() {
    sessionStorage.removeItem("attendant_code");
    router.replace("/attendant");
  }

  if (!code) return null;

  return (
    <main style={{ maxWidth: 1100, margin: "32px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><h1 style={{ margin: 0 }}>Pending Orders</h1><div style={{ color: "#666" }}>Attendant: <b>{code}</b></div></div>
        <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}>Logout</button>
      </header>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr><Th>Date</Th><Th>Shop</Th><Th>Product</Th><Th>Qty</Th><Th>Selling</Th><Th>Buying</Th><Th>Link</Th><Th>Action</Th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No pending orders 🎉</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <Td>—</Td>
                <Td>{r.shopName}</Td>
                <Td>{r.productName}</Td>
                <Td>{r.quantity}</Td>
                <Td>{r.sellingPricePerUnit ?? "-"}</Td>
                <Td>
                  <input
                    type="number"
                    min={0}
                    value={r.buyingPricePerUnit ?? ""}
                    onChange={(e) => setRows(prev => prev.map(x => x.id === r.id ? { ...x, buyingPricePerUnit: e.target.value === "" ? null : Number(e.target.value) } : x))}
                    style={input}
                  />
                </Td>
                <Td><a href={r.jumiaProductUrl} target="_blank" rel="noreferrer">Open</a></Td>
                <Td>
                  <button
                    disabled={saving === r.id || r.buyingPricePerUnit == null}
                    onClick={() => savePrice(r.id, r.buyingPricePerUnit as number)}
                    style={{ padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff", border: "none", cursor: "pointer", opacity: saving === r.id || r.buyingPricePerUnit == null ? 0.6 : 1 }}
                  >
                    {saving === r.id ? "Saving…" : "Save"}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign: "left", padding: 12, fontSize: 14, fontWeight: 600 }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={{ padding: 10 }}>{children}</td>; }
const input: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, width: 120 };
