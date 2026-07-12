'use client';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg max-w-md">
        <p className="mb-2"><strong>Name:</strong> {user?.name}</p>
        <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="mb-4"><strong>Role:</strong> <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded text-sm font-semibold">{user?.role}</span></p>
        <Button variant="destructive" onClick={handleLogout}>Sign Out</Button>
      </div>
    </div>
  );
}
