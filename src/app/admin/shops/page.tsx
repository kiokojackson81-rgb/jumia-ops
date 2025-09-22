"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------- Types ---------- */
type Shop = {
  id: number;
  name: string;
  active: boolean;
  apiKey?: string | null;
  apiSecret?: string | null;
  // Optional telemetry if your API returns them:
  lastImportedAt?: string | null;
  ordersToday?: number | null;
  ordersThisWeek?: number | null;
};

type Attendant = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

type AttendantAssignment = {
  attendantId: number;
  shopId: number;
};

export default function AdminShopsPage() {
  // Data
  const [shops, setShops] = useState<Shop[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<null | { mode: "create" } | { mode: "edit"; shop: Shop }>(null);
  const [assignShop, setAssignShop] = useState<Shop | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMap, setAssignMap] = useState<Record<number, boolean>>({}); // attendantId -> assigned?

  // Create/Edit form
  const [form, setForm] = useState({
    name: "",
    apiKey: "",
    apiSecret: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  /* ---------- Load data ---------- */
  async function loadAll() {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        fetch("/api/shops").then((r) => r.json()),
        fetch("/api/attendants").then((r) => r.json()),
      ]);
      setShops(s || []);
      setAttendants(a || []);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ---------- Helpers ---------- */
  function openCreate() {
    setPanel({ mode: "create" });
    setForm({ name: "", apiKey: "", apiSecret: "", active: true });
  }

  function openEdit(shop: Shop) {
    setPanel({ mode: "edit", shop });
    setForm({
      name: shop.name || "",
      apiKey: shop.apiKey || "",
      apiSecret: shop.apiSecret || "",
      active: !!shop.active,
    });
  }

  async function saveShop() {
    if (!form.name.trim()) return alert("Shop name is required.");
    setSaving(true);
    try {
      if (panel?.mode === "create") {
        const r = await fetch("/api/shops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            apiKey: form.apiKey || null,
            apiSecret: form.apiSecret || null,
            active: !!form.active,
          }),
        });
        if (!r.ok) throw new Error("Create failed");
      } else if (panel?.mode === "edit") {
        const id = (panel as any).shop.id;
        const r = await fetch(`/api/shops/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            apiKey: form.apiKey || null,
            apiSecret: form.apiSecret || null,
            active: !!form.active,
          }),
        });
        if (!r.ok) throw new Error("Update failed");
      }
      await loadAll();
      setPanel(null);
    } catch (e) {
      alert("Failed to save shop. Check server logs.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(shop: Shop) {
    try {
      await fetch(`/api/shops/${shop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !shop.active }),
      });
      await loadAll();
    } catch {
      alert("Failed to toggle active");
    }
  }

  async function importNow(shop: Shop) {
    if (!confirm(`Import latest orders for "${shop.name}" now?`)) return;
    try {
      const r = await fetch(`/api/shops/${shop.id}/import`, { method: "POST" });
      if (!r.ok) throw new Error("Import failed");
      alert("Import triggered. Check orders and reports shortly.");
      await loadAll();
    } catch {
      alert("Import failed. Check API credentials or server logs.");
    }
  }

  async function openAssignmentsFor(shop: Shop) {
    setAssignShop(shop);
    setAssignLoading(true);
    try {
      // Build initial map (assigned attendants)
      const assigned = await Promise.all(
        attendants.map(async (a) => {
          const res = await fetch(`/api/attendants/${a.id}/shops`);
          const data: Shop[] = await res.json();
          const isAssigned = (data || []).some((s) => s.id === shop.id);
          return [a.id, isAssigned] as const;
        })
      );
      const map: Record<number, boolean> = {};
      for (const [attId, ok] of assigned) map[attId] = ok;
      setAssignMap(map);
    } catch {
      // no-op
    } finally {
      setAssignLoading(false);
    }
  }

  function toggleAssignment(attendantId: number) {
    setAssignMap((prev) => ({ ...prev, [attendantId]: !prev[attendantId] }));
  }

  async function saveAssignments() {
    if (!assignShop) return;
    setAssignLoading(true);
    try {
      // For each attendant, call assign/unassign as needed
      await Promise.all(
        attendants.map(async (a) => {
          const want = !!assignMap[a.id];
          // read current
          const res = await fetch(`/api/attendants/${a.id}/shops`);
          const current: Shop[] = await res.json();
          const has = (current || []).some((s) => s.id === assignShop.id);

          if (want && !has) {
            await fetch(`/api/attendants/${a.id}/shops`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shopId: assignShop.id }),
            });
          } else if (!want && has) {
            await fetch(`/api/attendants/${a.id}/shops`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shopId: assignShop.id }),
            });
          }
        })
      );

      alert("Assignments saved.");
      setAssignShop(null);
    } catch {
      alert("Failed to save assignments.");
    } finally {
      setAssignLoading(false);
    }
  }

  const activeCount = useMemo(() => shops.filter((s) => s.active).length, [shops]);

  return (
    <main style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin · Shops</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Manage Jumia shops and credentials. Active shops can import orders. Assign attendants per shop.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={openCreate} style={btnPrimary}>Add Shop</button>
          <button onClick={loadAll} disabled={loading} style={btnSecondary}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* Overview cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <Card title="Total Shops" value={shops.length} />
        <Card title="Active Shops" value={activeCount} />
        <Card title="Attendants" value={attendants.length} />
      </section>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <Th>Shop</Th>
              <Th>Status</Th>
              <Th>Last Import</Th>
              <Th>Today</Th>
              <Th>This Week</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : shops.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No shops</td></tr>
            ) : (
              shops.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Td>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      key: {mask(s.apiKey)} • secret: {mask(s.apiSecret)}
                    </div>
                  </Td>
                  <Td>
                    <span style={badge(s.active ? "active" : "inactive")}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>{s.lastImportedAt ? new Date(s.lastImportedAt).toISOString().slice(0, 19).replace("T", " ") : "—"}</Td>
                  <Td>{s.ordersToday ?? "—"}</Td>
                  <Td>{s.ordersThisWeek ?? "—"}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => openEdit(s)} style={btnTiny}>Edit</button>
                      <button onClick={() => toggleActive(s)} style={btnTiny}>
                        {s.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => importNow(s)} style={btnTiny}>Import Now</button>
                      <button onClick={() => openAssignmentsFor(s)} style={btnTinyOutline}>Assign Attendants</button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer: Create/Edit shop */}
      {panel && (
        <div style={drawerBackdrop} onClick={() => setPanel(null)}>
          <div style={drawer} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {panel.mode === "create" ? "Add New Shop" : `Edit Shop • ${("shop" in panel && panel.shop.name) || ""}`}
            </h3>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={label}>
                <span>Shop Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={input}
                  placeholder="e.g. Baraka Electronics"
                />
              </label>
              <label style={label}>
                <span>API Key</span>
                <input
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  style={input}
                  placeholder="Paste API key"
                />
              </label>
              <label style={label}>
                <span>API Secret</span>
                <input
                  value={form.apiSecret}
                  onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                  style={input}
                  placeholder="Paste API secret"
                />
              </label>
              <label style={{ ...label, alignItems: "center", flexDirection: "row", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span>Active</span>
              </label>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setPanel(null)} style={btnSecondary}>Cancel</button>
                <button onClick={saveShop} disabled={saving} style={btnPrimary}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Assign attendants */}
      {assignShop && (
        <div style={drawerBackdrop} onClick={() => setAssignShop(null)}>
          <div style={drawer} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Assign Attendants • {assignShop.name}</h3>
            {assignLoading ? (
              <div>Loading assignments…</div>
            ) : attendants.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No attendants</div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 360, overflow: "auto", paddingRight: 4 }}>
                {attendants.map((a) => (
                  <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!assignMap[a.id]}
                      onChange={() => toggleAssignment(a.id)}
                    />
                    <span style={{ fontWeight: 600 }}>{a.name}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>({a.code})</span>
                    {!a.active && <span style={badge("inactive")}>inactive</span>}
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setAssignShop(null)} style={btnSecondary}>Close</button>
              <button onClick={saveAssignments} disabled={assignLoading} style={btnPrimary}>
                {assignLoading ? "Saving…" : "Save Assignments"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- Tiny components + styles ---------- */
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ color: "#6b7280", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: 12, fontSize: 14, fontWeight: 600 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: 10, verticalAlign: "top" }}>{children}</td>;
}

const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, width: "100%" };
const label: React.CSSProperties = { display: "grid", gap: 6 };
const btnPrimary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb", cursor: "pointer" };
const btnTiny: React.CSSProperties = { padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff", border: "none", cursor: "pointer" };
const btnTinyOutline: React.CSSProperties = { padding: "8px 10px", borderRadius: 6, background: "#fff", color: "#111827", border: "1px solid #d1d5db", cursor: "pointer" };

const drawerBackdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "grid", placeItems: "center", zIndex: 50,
};
const drawer: React.CSSProperties = {
  width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, boxShadow: "0 16px 40px rgba(17,24,39,.18)",
};

function mask(v?: string | null) {
  if (!v) return "—";
  if (v.length <= 6) return "*".repeat(v.length);
  return v.slice(0, 3) + "…" + v.slice(-3);
}

function badge(kind: "active" | "inactive"): React.CSSProperties {
  const base: React.CSSProperties = { padding: "2px 8px", borderRadius: 999, fontSize: 12, border: "1px solid #e5e7eb", background: "#fff" };
  if (kind === "active") return { ...base, borderColor: "#10b981", color: "#065f46" };
  return { ...base, borderColor: "#ef4444", color: "#7f1d1d" };
}
