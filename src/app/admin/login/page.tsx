'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const next = useSearchParams().get('next') || '/admin';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.href = next;
    else setError((await res.json().catch(() => ({} as any)))?.message || 'Login failed');
  }

  return (
    <main style={{ maxWidth: 420, margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Admin Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ marginBottom: 6 }}>Password</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="Enter admin password"
                 style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6 }} required />
        </label>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #222',
          background: '#111', color: '#fff', cursor: 'pointer' }}>
          Sign in
        </button>
      </form>
    </main>
  );
}
