'use client';

import { useAuthStore } from '@/lib/auth-store';
import { ReactNode } from 'react';

interface RoleGateProps {
  allow: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore();
  
  if (!user || !allow.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
