// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0e13] text-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Jumia Ops</h1>
        <p className="mt-2 text-slate-300">
          Welcome. Use the navigation to access Admin and Attendant areas.
        </p>

        <div className="mt-6 flex gap-3">
          <a
            href="/admin"
            className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Go to Admin
          </a>
          <a
            href="/attendant"
            className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Go to Attendant
          </a>
        </div>
      </div>
    </main>
  );
}
