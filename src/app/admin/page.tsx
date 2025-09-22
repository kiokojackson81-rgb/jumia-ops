// src/app/admin/page.tsx
import { getJson } from "@/lib/api";

type CountResp = { count: number };

async function fetchCount(path: string) {
  try {
    const r = await getJson<CountResp>(path);
    return r?.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [products, shops, attendants, orders, waitingReturns] = await Promise.all([
    fetchCount("/api/products/count"),
    fetchCount("/api/shops/count"),
    fetchCount("/api/attendants/count"),
    fetchCount("/api/orders/count"),
    fetchCount("/api/returns/waiting-pickup/count"),
  ]);

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi title="Products" value={products} />
        <Kpi title="Shops" value={shops} />
        <Kpi title="Attendants" value={attendants} />
        <Kpi title="Orders (total)" value={orders} />
        <Kpi title="Returns · Waiting Pickup" value={waitingReturns} accent />
      </section>

      {/* placeholders: keep simple to avoid client/server drift */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BigCard title="This Week · Revenue" note="Sum of selling price × qty" />
        <BigCard title="This Week · Buying Cost" note="Sum of buying price × qty" />
        <BigCard title="This Week · Profit / Loss" value="KES 0" accent />
      </section>
    </main>
  );
}

function Kpi({ title, value, accent = false }: { title: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-border">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className={`mt-3 text-3xl font-semibold ${accent ? "text-emerald-400" : ""}`}>{value}</div>
    </div>
  );
}

function BigCard({ title, note, value, accent = false }: { title: string; note?: string; value?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card p-6 ring-1 ring-border">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className={`mt-4 text-4xl font-semibold ${accent ? "text-emerald-400" : ""}`}>{value ?? "—"}</div>
      {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
