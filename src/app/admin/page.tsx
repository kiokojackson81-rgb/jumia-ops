// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Admin</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/admin/attendants">Attendants</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/products">Products</Link>
      </nav>
    </main>
  );
}
