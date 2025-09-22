"use client";

import { useEffect, useMemo, useState } from "react";

type Shop = { id: number; name: string };
type PendingOrder = {
  id: number;
  externalOrderId: string;
  shopId: number;
  shopName: string;
  productName: string;
  productSlug: string;
  quantity: number;
  sellingPricePerUnit: number | null;
  buyingPricePerUnit: number | null;
  jumiaProductUrl: string;
  orderedAt: string | null;
};

export default function AdminPendingPricing() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState<"all" | number>("all");

  const [rows, setRows] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [edited, setEdited] = useState<Record<number, number>>({}); // orderId -> new buying price

  // Load shops once
  useEffect(() => {
    fetch("/api/shops").then(r => r.json()).then(setShops);
  }, []);

  // Load pending orders whenever filter changes
  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    q.set("pendingPrice", "1");
    if (shopId !== "all") q.set("shopId", String(shopId));
    const r = await fetch(`/api/orders?${q.toString()}`);
    const data = await r.json();
    setRows(data);
    setEdited({});
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [shopId]);

  // For “Save All” button
  const dirtyCount = useMemo(() => Object.keys(edited).length, [edited]);

  function setEdit(id: number, price: number | null) {
    setEdited(prev => {
      const next = { ...prev };
      if (price == null || Number.isNaN(price)) delete next[id];
      else next[id] = price;
      return next;
    });
    setRows(prev => prev.map(r => (r.id === id ? { ...r, buyingPricePerUnit: price } : r)));
  }

  async function saveOne(id: number) {
    const price = edited[id];
    if (price == null || price < 0) return alert("Enter a valid price.");
    setSavingIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyingPricePerUnit: price }),
      });
      if (!res.ok) throw new Error("Save failed");
      // remove row from pending
      setRows(prev => prev.filter(r => r.id !== id));
      setEdited(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      alert("Failed to save price. Try again.");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function saveAll() {
    if (dirtyCount === 0) return;
    // Save sequentially to keep it simple & reliable
    for (const idStr of Object.keys(edited)) {
      const id = Number(idStr);
      await saveOne(id);
    }
  }

  function fmtKES(n: number | null) {
    if (n == null) return "-";
    try {
      return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n);
    } catch {
      return String(n);
    }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Admin · Pending Pricing</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value === "all" ? "all" : Number(e.target.value))}
            style={select}
          >
            <option value="all">All shops</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={load} style={btnSecondary} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
          <button onClick={saveAll} style={btnPrimary} disabled={dirtyCount === 0}>
            Save All {dirtyCount > 0 ? `(${dirtyCount})` : ""}
          </button>
        </div>
      </header>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <Th>Date</Th>
              <Th>Shop</Th>
              <Th>Order #</Th>
              <Th>Product</Th>
              <Th>Qty</Th>
              <Th>Selling (per unit)</Th>
              <Th>Buying (per unit)</Th>
              <Th>Link</Th>
              <Th style={{ width: 120 }}>Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No pending orders 🎉</td></tr>
            ) : rows.map(r => {
              const isSaving = savingIds.has(r.id);
              const priceVal = r.buyingPricePerUnit ?? "";
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Td>{r.orderedAt ? new Date(r.orderedAt).toISOString().slice(0,10) : "—"}</Td>
                  <Td>{r.shopName}</Td>
                  <Td>{r.externalOrderId}</Td>
                  <Td>{r.productName}</Td>
                  <Td>{r.quantity}</Td>
                  <Td>{fmtKES(r.sellingPricePerUnit)}</Td>
                  <Td>
                    <input
                      type="number"
                      min={0}
                      value={priceVal}
                      onChange={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        setEdit(r.id, v);
                      }}
                      placeholder="Enter price"
                      style={input}
                    />
                  </Td>
                  <Td>
                    <a href={r.jumiaProductUrl} target="_blank" rel="noreferrer">Open</a>
                  </Td>
                  <Td>
                    <button
                      disabled={isSaving || edited[r.id] == null}
                      onClick={() => saveOne(r.id)}
                      style={{
                        ...btnTiny,
                        opacity: isSaving || edited[r.id] == null ? 0.6 : 1,
                      }}
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, color: "#6b7280" }}>
        Tip: You can filter by shop, edit multiple prices, then click <b>Save All</b>.
      </p>
    </main>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ textAlign: "left", padding: 12, fontSize: 14, fontWeight: 600, ...style }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: 10, verticalAlign: "top" }}>{children}</td>;
}

const input: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, width: 130 };
const select: React.CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 };
const btnPrimary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb", cursor: "pointer" };
const btnTiny: React.CSSProperties = { padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
