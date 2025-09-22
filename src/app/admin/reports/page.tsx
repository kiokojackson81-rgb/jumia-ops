"use client";

import { useEffect, useMemo, useState } from "react";

type Shop = { id: number; name: string };
type Row = {
  key: string;
  weekStart: string;
  weekEnd: string;
  lines: number;
  units: number;
  deliveredUnits: number;
  revenueDelivered: number;
  costDelivered: number;
  profitDelivered: number;
  returnsUnits: number;
  returnsValue: number;
  netRevenueDelivered: number;
  ofdUnits: number;
  pipelineUnits: number;
};

export default function WeeklyReports() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState<"all" | number>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/shops").then(r => r.json()).then(setShops); }, []);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    if (shopId !== "all") q.set("shopId", String(shopId));
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const r = await fetch(`/api/reports/weekly?${q.toString()}`);
    const data = await r.json();
    setRows(data.rows || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [shopId, from, to]);

  useEffect(() => {
    const id = setInterval(() => load(), 15000);
    return () => clearInterval(id);
  }, [shopId, from, to]);

  const totals = useMemo(() => rows.reduce((a, r) => ({
    lines: a.lines + r.lines,
    units: a.units + r.units,
    deliveredUnits: a.deliveredUnits + r.deliveredUnits,
    revenueDelivered: a.revenueDelivered + r.revenueDelivered,
    costDelivered: a.costDelivered + r.costDelivered,
    profitDelivered: a.profitDelivered + r.profitDelivered,
    returnsUnits: a.returnsUnits + r.returnsUnits,
    returnsValue: a.returnsValue + r.returnsValue,
    netRevenueDelivered: a.netRevenueDelivered + r.netRevenueDelivered,
    ofdUnits: a.ofdUnits + r.ofdUnits,
    pipelineUnits: a.pipelineUnits + r.pipelineUnits,
  }), {
    lines: 0, units: 0, deliveredUnits: 0, revenueDelivered: 0, costDelivered: 0, profitDelivered: 0,
    returnsUnits: 0, returnsValue: 0, netRevenueDelivered: 0, ofdUnits: 0, pipelineUnits: 0,
  }), [rows]);

  function fmtKES(n: number) {
    try { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n || 0); }
    catch { return String(n); }
  }
  function weekLabel(sISO: string, eISO: string) {
    const s = new Date(sISO), e = new Date(eISO);
    return `${s.toISOString().slice(0,10)} → ${e.toISOString().slice(0,10)}`;
  }

  function exportCSV() {
    const headers = [
      "WeekStart","WeekEnd","Lines","Units","Delivered Units",
      "Revenue Delivered (KES)","Cost Delivered (KES)","Profit Delivered (KES)",
      "Returns Units","Returns Value (KES)","Net Revenue Delivered (KES)",
      "OFD Units","Pipeline Units"
    ];
    const body = rows.map(r => [
      r.weekStart, r.weekEnd, r.lines, r.units, r.deliveredUnits,
      r.revenueDelivered, r.costDelivered, r.profitDelivered,
      r.returnsUnits, r.returnsValue, r.netRevenueDelivered,
      r.ofdUnits, r.pipelineUnits
    ].join(",")).join("\n");
    const totalLine = [
      "TOTAL","",
      totals.lines, totals.units, totals.deliveredUnits,
      totals.revenueDelivered, totals.costDelivered, totals.profitDelivered,
      totals.returnsUnits, totals.returnsValue, totals.netRevenueDelivered,
      totals.ofdUnits, totals.pipelineUnits
    ].join(",");
    const csv = [headers.join(","), body, "", totalLine].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const shopName = shopId === "all" ? "all-shops" : (shops.find(s=>s.id===shopId)?.name ?? "shop").toLowerCase().replace(/\s+/g,"-");
    a.download = `weekly_report_${shopName}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Admin · Weekly Reports (Mon → Sun)</h1>
      <p style={{ marginTop: 0, color: "#6b7280" }}>
        Auto-recalculates as orders are delivered/returned/OFD. Refreshes every 15s.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
        <select value={shopId} onChange={e=>setShopId(e.target.value==="all"?"all":Number(e.target.value))} style={input}>
          <option value="all">All shops</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={input}/>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={input}/>
        <button onClick={load} disabled={loading} style={btnPrimary}>{loading ? "Loading…" : "Run"}</button>
        <button onClick={exportCSV} disabled={rows.length===0} style={btnSecondary}>Export CSV</button>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 16 }}>
        <Card title="Lines" value={totals.lines} />
        <Card title="Units" value={totals.units} />
        <Card title="Delivered Units" value={totals.deliveredUnits} />
        <Card title="Revenue (Delivered)" value={fmtKES(totals.revenueDelivered)} />
        <Card title="Returns (KES)" value={fmtKES(totals.returnsValue)} />
        <Card title="Net Revenue (Delivered - Returns)" value={fmtKES(totals.netRevenueDelivered)} />
      </section>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <Th>Week</Th>
              <Th>Lines</Th>
              <Th>Units</Th>
              <Th>Delivered Units</Th>
              <Th>Revenue (Delivered)</Th>
              <Th>Cost (Delivered)</Th>
              <Th>Profit (Delivered)</Th>
              <Th>Returns (u)</Th>
              <Th>Returns (KES)</Th>
              <Th><b>Net Revenue</b></Th>
              <Th>OFD (u)</Th>
              <Th>Pipeline (u)</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={12} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No data</td></tr>
            ) : rows.map(r => (
              <tr key={r.key} style={{ borderTop: "1px solid #e5e7eb" }}>
                <Td>{weekLabel(r.weekStart, r.weekEnd)}</Td>
                <Td>{r.lines}</Td>
                <Td>{r.units}</Td>
                <Td>{r.deliveredUnits}</Td>
                <Td>{fmtKES(r.revenueDelivered)}</Td>
                <Td>{fmtKES(r.costDelivered)}</Td>
                <Td><b>{fmtKES(r.profitDelivered)}</b></Td>
                <Td>{r.returnsUnits}</Td>
                <Td>{fmtKES(r.returnsValue)}</Td>
                <Td><b>{fmtKES(r.netRevenueDelivered)}</b></Td>
                <Td>{r.ofdUnits}</Td>
                <Td>{r.pipelineUnits}</Td>
              </tr>
            ))}
            {!loading && rows.length > 0 && (
              <tr style={{ borderTop: "2px solid #111827", background: "#fff" }}>
                <Td><b>Total</b></Td>
                <Td><b>{totals.lines}</b></Td>
                <Td><b>{totals.units}</b></Td>
                <Td><b>{totals.deliveredUnits}</b></Td>
                <Td><b>{fmtKES(totals.revenueDelivered)}</b></Td>
                <Td><b>{fmtKES(totals.costDelivered)}</b></Td>
                <Td><b>{fmtKES(totals.profitDelivered)}</b></Td>
                <Td><b>{totals.returnsUnits}</b></Td>
                <Td><b>{fmtKES(totals.returnsValue)}</b></Td>
                <Td><b>{fmtKES(totals.netRevenueDelivered)}</b></Td>
                <Td><b>{totals.ofdUnits}</b></Td>
                <Td><b>{totals.pipelineUnits}</b></Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return <div style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:12, background:"#fff" }}>
    <div style={{ color:"#6b7280", fontSize:12 }}>{title}</div>
    <div style={{ fontSize:18, fontWeight:700 }}>{value}</div>
  </div>;
}
function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign:"left", padding:12, fontSize:14, fontWeight:600 }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={{ padding:10 }}>{children}</td>; }

const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8 };
const btnPrimary: React.CSSProperties = { padding:"10px 12px", borderRadius:8, background:"#111827", color:"#fff", border:"none", cursor:"pointer" };
const btnSecondary: React.CSSProperties = { padding:"10px 12px", borderRadius:8, background:"#f3f4f6", color:"#111827", border:"1px solid #e5e7eb", cursor:"pointer" };
