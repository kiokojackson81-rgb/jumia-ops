// src/app/admin/pending-pricing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/api";

type Row = {
  orderId: number;
  product: string;
  quantity: number;
  sellPrice?: number;
  buyingPrice?: number;
};

export default function PendingPricingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await getJson<{ rows: Row[] }>("/api/attendants/pending");
      setRows(r?.rows ?? []);
    } catch {
      setMsg("Failed (HTTP 500)");
      setRows([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setPrices(orderId: number, sellPrice: number, buyingPrice: number) {
    try {
      await postJson(`/api/products/price`, { orderId, sellPrice, buyingPrice });
      await load();
    } catch {
      // keep UI stable
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pending Pricing</h1>
        <button onClick={load} className="rounded-md bg-muted px-3 py-1.5 text-sm">Refresh</button>
      </header>

      {msg && <p className="text-sm text-red-400">{msg}</p>}

      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Sell Price</th>
              <th className="px-4 py-3 text-left">Buying Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No pending rows.</td>
              </tr>
            ) : rows.map((r) => (
              <PendingRow key={r.orderId} row={r} onSave={setPrices} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function PendingRow({ row, onSave }: { row: Row; onSave: (orderId: number, sell: number, buy: number) => void }) {
  const [sell, setSell] = useState(row.sellPrice ?? 0);
  const [buy, setBuy] = useState(row.buyingPrice ?? 0);

  return (
    <tr className="border-t border-border/70">
      <td className="px-4 py-3">{row.orderId}</td>
      <td className="px-4 py-3">{row.product}</td>
      <td className="px-4 py-3">{row.quantity}</td>
      <td className="px-4 py-3">
        <input type="number" className="w-28 rounded bg-background px-2 py-1 ring-1 ring-border" value={sell} onChange={(e) => setSell(Number(e.target.value))} />
      </td>
      <td className="px-4 py-3">
        <input type="number" className="w-28 rounded bg-background px-2 py-1 ring-1 ring-border" value={buy} onChange={(e) => setBuy(Number(e.target.value))} />
      </td>
      <td className="px-4 py-3">
        <button onClick={() => onSave(row.orderId, sell, buy)} className="rounded-md bg-foreground px-3 py-1.5 text-background">Set</button>
      </td>
    </tr>
  );
}
