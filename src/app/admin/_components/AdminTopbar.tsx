// src/app/admin/_components/AdminTopbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getJson, apiBase } from "@/lib/api";

type Badge = number | null;

const tabs = [
  { href: "/admin", label: "Dashboard", match: /^\/admin\/?$/ },
  { href: "/admin/shops", label: "Shops", match: /^\/admin\/shops/ },
  { href: "/admin/attendants", label: "Attendants", match: /^\/admin\/attendants/ },
  { href: "/admin/pending-pricing", label: "Pending Pricing", match: /^\/admin\/pending-pricing/ },
  { href: "/admin/reports", label: "Reports", match: /^\/admin\/reports/ },
  { href: "/admin/returns", label: "Returns", match: /^\/admin\/returns/ },
];

export default function AdminTopbar() {
  const pathname = usePathname();
  const [api, setApi] = useState<string>(apiBase());
  const [pendingCnt, setPendingCnt] = useState<Badge>(null);
  const [waitingPickup, setWaitingPickup] = useState<Badge>(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const pending = await getJson<{ count: number }>("/api/attendants/pending");
        if (!ignore) setPendingCnt(typeof pending?.count === "number" ? pending.count : 0);
      } catch { if (!ignore) setPendingCnt(null); }

      try {
        const waiting = await getJson<{ count: number }>("/api/returns/waiting-pickup");
        if (!ignore) setWaitingPickup(typeof waiting?.count === "number" ? waiting.count : 0);
      } catch { if (!ignore) setWaitingPickup(null); }
    })();

    return () => { ignore = true; };
  }, [api]);

  const onApiChange = (v: string) => {
    const cleaned = v.trim().replace(/\/$/, "");
    if (cleaned) localStorage.setItem("adminApiBase", cleaned);
    else localStorage.removeItem("adminApiBase");
    setApi(cleaned);
  };

  const active = (rx: RegExp) => (rx.test(pathname ?? "") ? "text-white" : "text-slate-300");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0e13]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/admin" className="font-semibold tracking-wide text-white">
          Jumia Ops <span className="text-slate-400">· Admin</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 ml-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-md px-3 py-2 text-sm hover:text-white hover:bg-white/5 ${active(t.match)}`}
            >
              {t.label}
              {t.label === "Pending Pricing" && typeof pendingCnt === "number" && (
                <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                  {pendingCnt}
                </span>
              )}
              {t.label === "Returns" && typeof waitingPickup === "number" && (
                <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                  {waitingPickup}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <label className="text-xs text-slate-400">API:</label>
            <input
              value={api}
              onChange={(e) => onApiChange(e.target.value)}
              placeholder="(empty = same origin)"
              className="w-[320px] rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <Link
            href="/admin/login"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="md:hidden border-t border-white/10">
        <nav className="flex snap-x overflow-x-auto px-2 py-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`mr-2 shrink-0 snap-start rounded-md px-3 py-1.5 text-sm hover:text-white hover:bg-white/5 ${active(t.match)}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
