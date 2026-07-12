'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings } from 'lucide-react';

const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['FLEET_MANAGER', 'DRIVER'] },
  { href: '/fleet', label: 'Fleet', icon: Truck, roles: ['FLEET_MANAGER', 'DRIVER'] },
  { href: '/drivers', label: 'Drivers', icon: Users, roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'] },
  { href: '/trips', label: 'Trips', icon: Route, roles: ['FLEET_MANAGER', 'DRIVER'] },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
  { href: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['FLEET_MANAGER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  if (!user) return null;

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-[220px] shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-500" />
          TransitOps
        </h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          Smart Transport Operations
        </p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleNavItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-500 font-medium' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
