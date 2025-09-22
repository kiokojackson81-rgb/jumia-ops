export default function LogoutPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">You’ve logged out</h1>
      <p className="mt-2">See you again soon!</p>
      <a href="/admin/login" className="mt-4 text-blue-600 underline">
        Back to Login
      </a>
    </div>
  );
}
