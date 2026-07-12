'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export function Topbar() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setAuth(null, null);
      router.push('/login');
    }
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 w-96 relative">
        <Search className="h-4 w-4 absolute left-3 text-zinc-500" />
        <Input 
          placeholder="Search vehicles, trips, drivers..." 
          className="pl-9 bg-zinc-900/50 border-zinc-800 h-9 text-sm focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-zinc-200">{user.name}</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase tracking-wider bg-zinc-800/50 text-zinc-300 border-zinc-700">
            {user.role.replace('_', ' ')}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer border border-zinc-800 hover:border-zinc-700 transition-colors">
              <AvatarFallback className="bg-amber-500/10 text-amber-500 text-sm font-medium">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <DropdownMenuItem className="focus:bg-zinc-900 cursor-pointer text-sm" onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
