export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-2xl font-bold">Welcome to Jumia Ops</h1>
      <p className="text-gray-600 mt-2">
        Choose where you want to go:
      </p>
      <div className="flex gap-4 mt-6">
        <a
          href="/admin"
          className="px-4 py-2 bg-black text-white rounded-xl hover:opacity-80"
        >
          Admin Panel
        </a>
        <a
          href="/attendant"
          className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:opacity-80"
        >
          Attendant Panel
        </a>
      </div>
    </main>
  );
}
