// src/app/admin/reports/page.tsx
import { getJson } from "@/lib/api";

type WeeklyRow = {
  id: number;
  product: string;
  qty: number;
  price: number;    // sell price
  buy: number;      // buying price
};
type WeeklyResp = { rows: WeeklyRow[] };

export default async function ReportsPage() {
  let rows: WeeklyRow[] = [];
  try {
    const r = await getJson<WeeklyResp>("/api/reports/weekly");
    rows = r?.rows ?? [];
  } catch {
    rows = [];
  }

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Revenue</th>
              <th className="px-4 py-3 text-left">Buying Cost</th>
              <th className="px-4 py-3 text-left">P/L</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No weekly data yet.</td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={r.id} className="border-t border-border/70">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{r.product}</td>
                <td className="px-4 py-3">{r.qty}</td>
                <td className="px-4 py-3">KES {r.price * r.qty}</td>
                <td className="px-4 py-3">KES {r.buy * r.qty}</td>
                <td className="px-4 py-3">KES {(r.price - r.buy) * r.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
