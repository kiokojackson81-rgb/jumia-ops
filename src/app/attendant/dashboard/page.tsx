// src/app/attendant/dashboard/page.tsx
export default function AttendantDashboard() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Attendant Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome! This is where you’ll manage pricing, confirm picked orders, and attach returns.
      </p>

      {/* Example sections */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Pending Orders</h2>
        <div className="p-4 border rounded mt-2">
          {/* Replace with dynamic data */}
          <p>No pending orders yet.</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Update Product Price</h2>
        <form className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Product name"
            className="border p-2 rounded flex-1"
          />
          <input
            type="number"
            placeholder="New buying price"
            className="border p-2 rounded w-40"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </form>
      </section>
    </main>
  );
}
