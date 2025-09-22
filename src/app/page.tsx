"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "a") window.location.href = "/attendant";
      if (e.key.toLowerCase() === "d") window.location.href = "/admin";
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={page}>
      {/* Header */}
      <header style={header}>
        <div style={brandWrap}>
          <div style={logo}>J</div>
          <div>
            <div style={brand}>Jumia Ops</div>
            <div style={tagline}>Multi-shop pricing & reporting console</div>
          </div>
        </div>
        <nav style={nav}>
          <Link href="/admin" style={navLink}>Admin</Link>
          <Link href="/attendant" style={navLink}>Attendant</Link>
        </nav>
      </header>

      {/* Hero */}
      <main style={hero}>
        <div style={heroCopy}>
          <h1 style={h1}>
            One dashboard for <span style={gradText}>all your Jumia shops</span>
          </h1>
          <p style={subhead}>
            Import orders, auto-learn buying prices, assign attendants per shop, and manage everything in one place.
          </p>

          <div style={ctaRow}>
            <Link href="/attendant" style={{ ...btn, ...btnPrimary }}>
              Attendant Login <kbd style={kbd}>A</kbd>
            </Link>
            <Link href="/admin" style={{ ...btn, ...btnGhost }}>
              Admin Login <kbd style={kbd}>D</kbd>
            </Link>
          </div>

          <div style={miniNote}>Tip: Press <b>A</b> or <b>D</b> on your keyboard.</div>
        </div>

        {/* Demo Panel */}
        <div style={panelWrap}>
          <div style={panel}>
            <div style={panelHeader}>
              <span style={dot} /><span style={dot} /><span style={dot} />
            </div>
            <div style={panelBody}>
              <div style={mockCard}>
                <div style={mockTitle}>Today’s Snapshot</div>
                <div style={statsGrid}>
                  <Stat label="Orders" value="12" />
                  <Stat label="Units" value="19" />
                </div>
                <div style={progressBarWrap}>
                  <div style={progressLabel}><span>Pending Pricing</span><span>3</span></div>
                  <div style={progressBarTrack}>
                    <div style={progressBarFill} />
                  </div>
                </div>
              </div>
              <div style={hint}>Demo preview • Connect shops to see live data</div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights */}
      <section style={features}>
        <Feature
          title="Assign attendants to shops"
          desc="Each attendant only sees and prices orders for their assigned shops."
          icon="👥"
        />
        <Feature
          title="Auto-learn buying prices"
          desc="Once a product is priced, future orders with the same name get auto-filled."
          icon="🧠"
        />
        <Feature
          title="Track pending pricing"
          desc="Always know which orders still need a buying price before reporting."
          icon="⏳"
        />
        <Feature
          title="Fast order imports"
          desc="Pull new orders per shop and track status like OFD, Delivered, Returned."
          icon="⚡"
        />
      </section>

      {/* Footer */}
      <footer style={footer}>
        <div>© {new Date().getFullYear()} Jumia Ops</div>
        <div style={{ color: "#6b7280" }}>Built for speed • Designed for clarity</div>
      </footer>
    </div>
  );
}

/* ---------- Reusable Components ---------- */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={stat}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div style={featCard}>
      <div style={featIcon}>{icon}</div>
      <div style={featTitle}>{title}</div>
      <div style={featDesc}>{desc}</div>
    </div>
  );
}

/* ---------- Styles ---------- */
const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(180deg, #ffffff, #fafafa 40%, #f6f7fb)",
};
const header: React.CSSProperties = {
  height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 16px", borderBottom: "1px solid #eef0f3", background: "rgba(255,255,255,0.8)",
};
const brandWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const logo: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10,
  background: "linear-gradient(135deg, #111827, #3b82f6)",
  color: "white", display: "grid", placeItems: "center", fontWeight: 800,
};
const brand: React.CSSProperties = { fontWeight: 800, fontSize: 16, color: "#111827" };
const tagline: React.CSSProperties = { fontSize: 12, color: "#6b7280" };

const nav: React.CSSProperties = { display: "flex", gap: 8 };
const navLink: React.CSSProperties = {
  padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb",
  background: "#f9fafb", color: "#111827", textDecoration: "none", fontSize: 14,
};

const hero: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24,
  padding: "48px 16px", maxWidth: 1200, margin: "0 auto",
};
const heroCopy: React.CSSProperties = { paddingRight: 8 };
const h1: React.CSSProperties = { fontSize: 36, fontWeight: 800, marginBottom: 10 };
const gradText: React.CSSProperties = {
  background: "linear-gradient(135deg, #111827, #3b82f6 60%, #06b6d4)",
  WebkitBackgroundClip: "text", color: "transparent",
};
const subhead: React.CSSProperties = { color: "#4b5563", fontSize: 16, marginBottom: 16 };

const ctaRow: React.CSSProperties = { display: "flex", gap: 12 };
const btn: React.CSSProperties = {
  padding: "12px 14px", borderRadius: 10, fontWeight: 700,
  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
};
const btnPrimary: React.CSSProperties = { background: "#111827", color: "white" };
const btnGhost: React.CSSProperties = { background: "white", border: "1px solid #e5e7eb", color: "#111827" };
const kbd: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 6px", fontSize: 12 };

const miniNote: React.CSSProperties = { color: "#6b7280", fontSize: 13, marginTop: 8 };

const panelWrap: React.CSSProperties = { display: "grid", placeItems: "center" };
const panel: React.CSSProperties = {
  maxWidth: 420, borderRadius: 16, border: "1px solid #e5e7eb",
  background: "white", boxShadow: "0 12px 30px rgba(17,24,39,0.08)",
};
const panelHeader: React.CSSProperties = { height: 38, borderBottom: "1px solid #f1f3f5", display: "flex", gap: 6, padding: "0 10px" };
const dot: React.CSSProperties = { width: 10, height: 10, borderRadius: 10, background: "#e5e7eb" };
const panelBody: React.CSSProperties = { padding: 14 };

const mockCard: React.CSSProperties = {
  border: "1px solid #eef0f3", borderRadius: 12, padding: 12,
  background: "#fafafa", display: "grid", gap: 10,
};
const mockTitle: React.CSSProperties = { fontWeight: 700, color: "#111827" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 };
const stat: React.CSSProperties = { border: "1px solid #eef0f3", borderRadius: 10, padding: 10, background: "white" };
const statLabel: React.CSSProperties = { fontSize: 12, color: "#6b7280" };
const statValue: React.CSSProperties = { fontSize: 16, fontWeight: 800 };

const progressBarWrap: React.CSSProperties = { display: "grid", gap: 6 };
const progressLabel: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" };
const progressBarTrack: React.CSSProperties = { width: "100%", height: 10, borderRadius: 999, background: "#f9fafb" };
const progressBarFill: React.CSSProperties = { height: "100%", width: "25%", background: "linear-gradient(90deg, #3b82f6, #06b6d4)" };
const hint: React.CSSProperties = { fontSize: 12, color: "#6b7280", textAlign: "center" };

const features: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14,
  maxWidth: 1200, margin: "8px auto 32px", padding: "0 16px",
};
const featCard: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 14 };
const featIcon: React.CSSProperties = { fontSize: 20 };
const featTitle: React.CSSProperties = { fontWeight: 700, color: "#111827" };
const featDesc: React.CSSProperties = { color: "#6b7280", fontSize: 14 };

const footer: React.CSSProperties = { borderTop: "1px solid #eef0f3", padding: "18px 16px", display: "flex", justifyContent: "space-between" };
