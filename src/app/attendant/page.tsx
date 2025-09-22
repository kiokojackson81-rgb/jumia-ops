// src/app/attendant/dashboard/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

/** ---------------------------
 *  Types (intentionally loose)
 *  --------------------------- */
type AnyObj = Record<string, any>;
interface Order {
  id: number;
  status?: string;
  quantity?: number;
  price?: number;
  createdAt?: string;
  product?: {
    id?: number;
    name?: string;
    slug?: string;
    price?: number;
    lastBuyingPrice?: number | null;
    [k: string]: any;
  } | null;
  [k: string]: any;
}

/** ---------------------------
 *  Small helpers
 *  --------------------------- */
async function safeJson(res: Response) {
  // Avoid “Unexpected end of JSON input”
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function money(n?: number | null) {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(
    n
  );
}

function clsx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/** =========================================================
 *  Attendant Dashboard
 *  ========================================================= */
export default function AttendantDashboard() {
  const [pending, setPending] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Price modal state
  const [openPriceFor, setOpenPriceFor] = useState<Order | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  // Return modal state
  const [openReturnFor, setOpenReturnFor] = useState<Order | null>(null);
  const [returnNote, setReturnNote] = useState('');
  const [returnFile, setReturnFile] = useState<File | null>(null);
  const [returnBusy, setReturnBusy] = useState(false);

  const loadingList = pending === null && !err;

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPending() {
    try {
      setErr(null);
      setPending(null);
      const r = await fetch('/api/attendants/pending', { cache: 'no-store' });
      if (!r.ok) {
        const data = await safeJson(r);
        throw new Error(data?.message || `Failed to load (HTTP ${r.status})`);
      }
      const data = await safeJson(r);
      const rows: Order[] = Array.isArray(data) ? data : data?.rows || [];
      setPending(rows);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load data');
      setPending([]);
    }
  }

  function openPriceModal(o: Order) {
    setOpenPriceFor(o);
    // prefill with lastBuyingPrice if present
    const prefill = o.product?.lastBuyingPrice ?? o.product?.price ?? o.price ?? '';
    setNewPrice(prefill ? String(prefill) : '');
  }

  async function savePrice() {
    if (!openPriceFor) return;
    const id = openPriceFor.id;
    const intPrice = Number(newPrice);
    if (!Number.isFinite(intPrice) || intPrice <= 0) {
      alert('Enter a valid buying price');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/attendants/orders/${id}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: intPrice }),
      });
      const data = await safeJson(r);
      if (!r.ok) throw new Error(data?.message || `Failed (HTTP ${r.status})`);

      // Optimistic update: tag the order with the new buying price
      setPending((cur) =>
        (cur || []).map((o) =>
          o.id === id ? { ...o, product: { ...(o.product || {}), lastBuyingPrice: intPrice } } : o,
        ),
      );
      setOpenPriceFor(null);
      setNewPrice('');
    } catch (e: any) {
      alert(e?.message || 'Failed to save price');
    } finally {
      setLoading(false);
    }
  }

  /** Optional return submit — tries POST /api/returns with FormData, but is safe if not present. */
  async function submitReturn() {
    if (!openReturnFor) return;
    setReturnBusy(true);
    try {
      const fd = new FormData();
      fd.append('orderId', String(openReturnFor.id));
      if (returnNote) fd.append('note', returnNote);
      if (returnFile) fd.append('photo', returnFile);

      const r = await fetch('/api/returns', { method: 'POST', body: fd });
      if (!r.ok) {
        // graceful message – endpoint might not exist in this repo yet
        throw new Error('The returns endpoint is not available. Ask the admin to enable it.');
      }
      // success
      setOpenReturnFor(null);
      setReturnNote('');
      setReturnFile(null);
      alert('Return submitted.');
    } catch (e: any) {
      alert(e?.message || 'Failed to submit return');
    } finally {
      setReturnBusy(false);
    }
  }

  const count = pending?.length || 0;

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Attendant Dashboard</h1>
          <p className="text-sm text-gray-500">
            Set buying prices, review pending orders, and attach return notes/photos.
          </p>
        </div>
        <button
          onClick={loadPending}
          className="rounded-lg px-3 py-2 text-sm bg-black text-white active:opacity-90"
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {/* Quick stats */}
      <section className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard title="Pending Orders" value={String(count)} />
        <StatCard
          title="With Buying Price"
          value={String((pending || []).filter((o) => !!o.product?.lastBuyingPrice).length)}
        />
        <StatCard
          title="Without Buying Price"
          value={String((pending || []).filter((o) => !o.product?.lastBuyingPrice).length)}
          className="hidden sm:block"
        />
      </section>

      {/* List */}
      <section className="mt-6">
        <h2 className="font-semibold text-lg">Orders awaiting action</h2>

        {loadingList && (
          <div className="mt-4 text-sm text-gray-500">Loading pending orders…</div>
        )}

        {err && (
          <div className="mt-4 text-sm text-red-600">{err}</div>
        )}

        {!loadingList && !err && !count && (
          <div className="mt-4 text-sm text-gray-500">Nothing pending — you’re all caught up 🎉</div>
        )}

        <ul className="mt-4 space-y-3">
          {(pending || []).map((o) => (
            <li
              key={o.id}
              className="border rounded-xl p-3 sm:p-4 bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {o.product?.name || 'Unknown product'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Qty: {o.quantity ?? '—'} · Sales Price: {money(o.product?.price ?? o.price)}
                </div>
                <div className="text-xs text-gray-500">
                  Buying Price:{' '}
                  <span className={clsx(o.product?.lastBuyingPrice ? 'text-emerald-600' : 'text-red-600')}>
                    {o.product?.lastBuyingPrice ? money(o.product.lastBuyingPrice) : 'not set'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openPriceModal(o)}
                  className="rounded-lg px-3 py-2 text-sm border bg-white hover:bg-gray-50 active:opacity-90"
                >
                  Set Buying Price
                </button>
                <button
                  onClick={() => setOpenReturnFor(o)}
                  className="rounded-lg px-3 py-2 text-sm border bg-white hover:bg-gray-50 active:opacity-90"
                >
                  Attach Return
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Price modal */}
      {openPriceFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-5">
            <h3 className="text-lg font-semibold">Set Buying Price</h3>
            <p className="text-sm text-gray-500 mt-1">
              {openPriceFor.product?.name || 'Product'}
            </p>

            <label className="block mt-4 text-sm">
              Buying price (KES)
              <input
                inputMode="numeric"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="e.g. 450"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpenPriceFor(null)}
                className="rounded-lg px-3 py-2 text-sm border bg-white"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={savePrice}
                className="rounded-lg px-3 py-2 text-sm bg-black text-white"
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Save Price'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {openReturnFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-5">
            <h3 className="text-lg font-semibold">Attach Return</h3>
            <p className="text-sm text-gray-500 mt-1">
              {openReturnFor.product?.name || 'Product'}
            </p>

            <label className="block mt-4 text-sm">
              Note (optional)
              <textarea
                rows={3}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="Short note about the return…"
              />
            </label>

            <label className="block mt-3 text-sm">
              Photo (optional)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReturnFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm"
              />
            </label>

            <div className="mt-5 flex justify-between gap-2">
              <button
                onClick={() => {
                  setOpenReturnFor(null);
                  setReturnNote('');
                  setReturnFile(null);
                }}
                className="rounded-lg px-3 py-2 text-sm border bg-white"
                disabled={returnBusy}
              >
                Cancel
              </button>
              <button
                onClick={submitReturn}
                className="rounded-lg px-3 py-2 text-sm bg-black text-white"
                disabled={returnBusy}
              >
                {returnBusy ? 'Submitting…' : 'Submit Return'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              If your environment doesn’t have a <code>/api/returns</code> endpoint yet, this
              will show a friendly error — it won’t break the page.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

/** ---------------------------
 *  Small card component
 *  --------------------------- */
function StatCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <div className={clsx('rounded-2xl border p-3 sm:p-4 bg-white', className)}>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
