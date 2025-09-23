export default function AdminLoginPage() {
  // super simple placeholder page — you can style later
  return (
    <main style={{minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24}}>
      <div style={{maxWidth: 360, width: '100%'}}>
        <h1 style={{marginBottom: 16}}>Admin Login</h1>
        <form method="POST" action="/api/admin/login" style={{display: 'grid', gap: 12}}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}
