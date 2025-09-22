"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  slug: string;
  name: string;
  lastBuyingPrice: number | null;
  ordersUnpriced?: number; // returned by API for convenience
};

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Product[]>([]);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [applyingSlug, setApplyingSlug] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const r = await fetch(`/api/products?${params.toString()}`);
      const data = await r.json();
      setRows(Array.isArray(data?.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const totalUnpriced = useMemo(
    () => rows.reduce((a, r) => a + (r.ordersUnpriced || 0), 0), [rows]
  );

  async function savePrice(p: Product, newPriceStr: string) {
    const newPrice = Number(newPriceStr);
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      alert("Enter a valid positive number.");
      return;
    }
    setSavingSlug(p.slug);
    try {
      const r = await fetch(`/api/products/${encodeURIComponent(p.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastBuyingPrice: newPrice }),
      });
      if (!r.ok) throw new Error("save failed");
      await load();
    } catch {
      alert("Failed to save price.");
    } finally {
      setSavingSlug(null);
    }
  }

  async function applyToOrders(p: Product) {
    if (!confirm(`Apply ${fmtKES(p.lastBuyingPrice || 0)} to ALL unpriced orders for "${p.name}"?`)) return;
    setApplyingSlug(p.slug);
    try {
      const r = await fetch(`/api/products/${encodeURIComponent(p.slug)}/apply`, {
        method: "POST",
      });
      if (!r.ok) throw new Error("apply failed");
      await load();
      alert("Applied to unpriced orders.");
    } catch {
      alert("Failed to apply price to orders.");
    } finally {
      setApplyingSlug(null);
    }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin · Products</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Edit Last Buying Price. Backfill unpriced orders with the latest price.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search by name or slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={input}
          />
          <button onClick={load} disabled={loading} style={btnPrimary}>{loading ? "Searching…" : "Search"}</button>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0" }}>
        <Card title="Products" value={rows.length} />
        <Card title="Unpriced orders (visible set)" value={totalUnpriced} />
        <Card title="Tip" value="Use Apply to backfill" />
      </section>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <Th>Product</Th>
              <Th>Slug</Th>
              <Th>Last Buying Price</Th>
              <Th>Unpriced Orders</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No products</td></tr>
            ) : (
              rows.map((p) => (
                <ProductRow
                  key={p.slug}
                  p={p}
                  saving={savingSlug === p.slug}
                  applying={applyingSlug === p.slug}
                  onSave={savePrice}
                  onApply={applyToOrders}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function ProductRow({
  p, saving, applying, onSave, onApply
}: {
  p: Product;
  saving: boolean;
  applying: boolean;
  onSave: (p: Product, value: string) => void;
  onApply: (p: Product) => void;
}) {
  const [val, setVal] = useState<string>(p.lastBuyingPrice != null ? String(p.lastBuyingPrice) : "");
  useEffect(() => { setVal(p.lastBuyingPrice != null ? String(p.lastBuyingPrice) : ""); }, [p.lastBuyingPrice]);

  return (
    <tr style={{ borderTop: "1px solid #e5e7eb" }}>
      <Td>
        <div style={{ fontWeight: 700 }}>{p.name}</div>
      </Td>
      <Td style={{ fontFamily: "monospace" }}>{p.slug}</Td>
      <Td>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ ...input, width: 160 }}
            placeholder="e.g. 1299"
            inputMode="decimal"
          />
          <button onClick={() => onSave(p, val)} disabled={saving} style={btnPrimary}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Td>
      <Td>{p.ordersUnpriced ?? 0}</Td>
      <Td>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => onApply(p)} disabled={applying || !p.lastBuyingPrice} style={btnSecondary}>
            {applying ? "Applying…" : "Apply to unpriced orders"}
          </button>
        </div>
      </Td>
    </tr>
  );
}

/* small UI bits */
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ color: "#6b7280", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{String(value)}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: 12, fontSize: 14, fontWeight: 600 }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: 10, verticalAlign: "top", ...style }}>{children}</td>;
}
const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 };
const btnPrimary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb", cursor: "pointer" };
function fmtKES(n: number) {
  try { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n || 0); }
  catch { return String(n); }
}
