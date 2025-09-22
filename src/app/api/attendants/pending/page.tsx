"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: number;
  externalOrderId: string;
  shopName: string;
  productName: string;
  productSlug: string;
  quantity: number;
  sellingPricePerUnit: number | null;
  buyingPricePerUnit: number | null;
  orderedAt: string | null;
  editableThisWeek?: boolean;
};

async function fetchPendingAndRecent(): Promise<{ pending: Row[]; editable: Row[] }> {
  const r = await fetch("/api/attendant/pending");
  return r.json();
}

export default function AttendantPending() {
  const [pending, setPending] = useState<Row[]>([]);
  const [editable, setEditable] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchPendingAndRecent();
      setPending(data.pending || []);
      setEditable(data.editable || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const totalPending = useMemo(() => pending.length, [pending]);

  async function savePrice(row: Row, inputValue: string) {
    const price = Number(inputValue);
    if (!Number.isFinite(price) || price < 0) return alert("Enter valid number.");
    setSaving(row.id);
    try {
      const r = await fetch(`/api/attendant/orders/${row.id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyingPricePerUnit: price }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Failed to save");
        return;
      }
      await load();
    } finally {
      setSaving(null);
    }
  }

  return (
    <main style={wrap}>
      <header style={hdr}>
        <h1>Pending Pricing</h1>
        <button onClick={load} disabled={loading} style={btn}>{loading ? "Refreshing…" : "Refresh"}</button>
      </header>

      <section style={stats}>
        <Badge title="Pending" value={totalPending} />
        <Badge title="Editable (this week)" value={editable.length} />
      </section>

      <h3>Needs Price</h3>
      {loading ? <p>Loading…</p> : pending.length === 0 ? <p>None</p> : pending.map((row) =>
        <PriceCard key={row.id} row={row} saving={saving === row.id} onSave={savePrice} />)}

      <h3>Already Priced (Editable This Week)</h3>
      {editable.length === 0 ? <p>None</p> : editable.map((row) =>
        <EditableCard key={row.id} row={row} saving={saving === row.id} onSave={savePrice} />)}
    </main>
  );
}

function PriceCard({ row, saving, onSave }:{ row: any; saving: boolean; onSave: (r:any,v:string)=>void }) {
  const [val, setVal] = useState<string>(row.buyingPricePerUnit != null ? String(row.buyingPricePerUnit) : "");
  return (
    <div style={card}>
      <div style={{ fontWeight: 600 }}>{row.productName}</div>
      <small>Order #{row.externalOrderId} | Shop: {row.shopName} | Qty: {row.quantity}</small>
      <div style={rowStyle}>
        <input value={val} onChange={(e)=>setVal(e.target.value)} style={input} inputMode="decimal" placeholder="Buying price" />
        <button onClick={()=>onSave(row, val)} disabled={saving} style={btn}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

function EditableCard({ row, saving, onSave }:{ row:any; saving:boolean; onSave:(r:any,v:string)=>void }) {
  const [val, setVal] = useState<string>(row.buyingPricePerUnit != null ? String(row.buyingPricePerUnit) : "");
  return (
    <div style={card}>
      <div style={{ fontWeight: 600 }}>{row.productName}</div>
      <small>Order #{row.externalOrderId} | Shop: {row.shopName} | Qty: {row.quantity}</small>
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginTop:8 }}>
        <span style={row.editableThisWeek ? chipOk : chipNo}>
          {row.editableThisWeek ? "Editable this week" : "Locked"}
        </span>
      </div>
      <div style={rowStyle}>
        <input value={val} onChange={(e)=>setVal(e.target.value)} style={input} inputMode="decimal" />
        <button
          onClick={()=>onSave(row, val)}
          disabled={saving || !row.editableThisWeek}
          style={btn}
          title={row.editableThisWeek ? "Save" : "Edit window closed"}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Badge({ title, value }: { title: string; value: any }) {
  return <div style={badge}><div>{title}</div><div style={{ fontWeight: 700 }}>{String(value)}</div></div>;
}

const wrap: React.CSSProperties = { maxWidth: 720, margin: "16px auto", padding: "0 12px", fontFamily: "system-ui, sans-serif" };
const hdr: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
const stats: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 12 };
const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 8, background: "#fff" };
const rowStyle: React.CSSProperties = { display: "flex", gap: 8, marginTop: 8 };
const input: React.CSSProperties = { flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 16 };
const btn: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "none", background: "#111827", color: "#fff" };
const badge: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", background: "#fff" };
const chipOk: React.CSSProperties = { padding:"2px 8px", borderRadius:999, border:"1px solid #10b981", color:"#065f46", fontSize:12 };
const chipNo: React.CSSProperties = { padding:"2px 8px", borderRadius:999, border:"1px solid #ef4444", color:"#7f1d1d", fontSize:12 };
