// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";

type Summary = {
  products: number;
  shops: number;
  attendants: number;
  orders: number;
  revenueThisWeek: number;
  buyingThisWeek: number;
  profitThisWeek: number;
  returnsWaitingPickup: number;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch("/api/reports/summary", { cache: "no-store" });
        if (!r.ok) throw new Error(`summary ${r.status}`);
        const j = (await r.json()) as Summary;
        if (!ignore) setData(j);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load summary");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const n = (v?: number) =>
    typeof v === "number"
      ? new Intl.NumberFormat(undefined).format(v)
      : "—";

  return (
    <main className="mx-auto max-w-7xl p-6 text-slate-100">
      <h1 className="mb-4 text-3xl font-semibold">Dashboard</h1>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile title="Products" value={n(data?.products)} />
        <Tile title="Shops" value={n(data?.shops)} />
        <Tile title="Attendants" value={n(data?.attendants)} />
        <Tile title="Orders (total)" value={n(data?.orders)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Wide title="This Week · Revenue" value={`KES ${n(data?.revenueThisWeek)}`} />
        <Wide title="This Week · Buying Cost" value={`KES ${n(data?.buyingThisWeek)}`} />
        <Wide title="This Week · Profit / Loss" value={`KES ${n(data?.profitThisWeek)}`} big />
      </div>

      <div className="mt-6 grid gap-4">
        <Tile title="Returns · Waiting Pickup" value={n(data?.returnsWaitingPickup)} />
      </div>
    </main>
  );
}

function Tile({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0e13] p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Wide({
  title,
  value,
  big,
}: {
  title: string;
  value: string | number;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0e13] p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className={`mt-2 ${big ? "text-4xl" : "text-2xl"} font-semibold`}>
        {value}
      </div>
      {!big && (
        <div className="mt-1 text-xs text-slate-400">
          Sum of selling/buying price × qty
        </div>
      )}
      {big && <div className="mt-1 text-sm text-slate-400">Gross profit</div>}
    </div>
  );
}
