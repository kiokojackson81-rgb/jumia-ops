"use client";
import { useEffect, useState } from "react";

type Shop = { id: number; name: string };
type Attendant = { id: number; code: string; name: string; active: boolean; shops: { shop: Shop }[] };

export default function AdminAttendants() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [rows, setRows] = useState<Attendant[]>([]);
  const [name, setName] = useState(""); const [code, setCode] = useState("");

  async function loadAll() {
    const s = await fetch("/api/shops").then(r=>r.json()); setShops(s);
    const a = await fetch("/api/attendants").then(r=>r.json()); setRows(a);
  }
  useEffect(()=>{ loadAll(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/attendants", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ name, code }) });
    if (r.ok) { setName(""); setCode(""); loadAll(); } else alert("Create failed");
  }

  async function saveAssign(attId: number, selected: number[]) {
    const r = await fetch(`/api/attendants/${attId}/shops`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ shopIds: selected }) });
    if (!r.ok) alert("Assign failed"); else loadAll();
  }

  return (
    <main style={{ maxWidth: 1000, margin: "32px auto", fontFamily: "sans-serif" }}>
      <h1>Admin · Attendants</h1>

      <form onSubmit={add} style={{ display: "grid", gap: 10, maxWidth: 520, marginBottom: 16 }}>
        <input placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} style={input}/>
        <input placeholder="Unique code e.g. BR1234" value={code} onChange={(e)=>setCode(e.target.value)} style={input}/>
        <button style={btn}>Add Attendant</button>
      </form>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr><Th>ID</Th><Th>Name</Th><Th>Code</Th><Th>Active</Th><Th>Assigned Shops</Th><Th>Assign</Th></tr>
          </thead>
          <tbody>
            {rows.map(att => {
              const assigned = new Set(att.shops.map(s => s.shop.id));
              return (
                <tr key={att.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Td>{att.id}</Td><Td>{att.name}</Td><Td><code>{att.code}</code></Td><Td>{att.active ? "Yes" : "No"}</Td>
                  <Td>{att.shops.map(s => s.shop.name).join(", ") || "-"}</Td>
                  <Td>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {shops.map(s => (
                        <label key={s.id} style={{ border:"1px solid #ddd", padding:"4px 6px", borderRadius:6 }}>
                          <input
                            type="checkbox"
                            checked={assigned.has(s.id)}
                            onChange={(e) => {
                              const next = new Set(assigned);
                              if (e.target.checked) next.add(s.id); else next.delete(s.id);
                              saveAssign(att.id, Array.from(next));
                            }}
                          />{" "}{s.name}
                        </label>
                      ))}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign:"left", padding:12, fontSize:14, fontWeight:600 }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={{ padding:10 }}>{children}</td>; }
const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8 };
const btn: React.CSSProperties = { padding:"8px 10px", borderRadius:6, background:"#111827", color:"#fff", border:"none", cursor:"pointer" };
