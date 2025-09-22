// src/app/admin/returns/page.tsx
import { getJson } from "@/lib/api";

type ReturnRow = { id: number; orderId: number; product: string; status: string };

export default async function ReturnsPage() {
  let rows: ReturnRow[] = [];
  try {
    const r = await getJson<{ rows: ReturnRow[] }>("/api/returns/waiting-pickup");
    rows = r?.rows ?? [];
  } catch {
    rows = [];
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Returns · Waiting Pickup</h1>

      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No returns currently waiting for pickup.</td>
              </tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-t border-border/70">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.orderId}</td>
                <td className="px-4 py-3">{r.product}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
