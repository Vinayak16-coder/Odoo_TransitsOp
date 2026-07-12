'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Eye, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type PermissionLevel = 'full' | 'view' | 'none';

type RolePermissions = {
  [module: string]: PermissionLevel;
};

type PermissionsMatrix = {
  [role: string]: RolePermissions;
};

export function PermissionsGrid() {
  const [matrix, setMatrix] = useState<PermissionsMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatrix = async () => {
      try {
        const res = await apiFetch('/users/permissions-matrix');
        if (res.success) {
          setMatrix(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMatrix();
  }, []);

  if (loading) {
    return <div className="text-zinc-500 animate-pulse">Loading permissions matrix...</div>;
  }

  if (!matrix) {
    return <div className="text-red-500">Failed to load permissions.</div>;
  }

  const roles = Object.keys(matrix);
  const modules = Object.keys(matrix[roles[0]] || {});

  const renderBadge = (level: PermissionLevel) => {
    switch (level) {
      case 'full':
        return (
          <Badge variant="outline" className="border-green-900 bg-green-950/30 text-green-400 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Full
          </Badge>
        );
      case 'view':
        return (
          <Badge variant="outline" className="border-blue-900 bg-blue-950/30 text-blue-400 gap-1">
            <Eye className="h-3 w-3" /> View Only
          </Badge>
        );
      case 'none':
      default:
        return (
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-500 gap-1">
            <ShieldAlert className="h-3 w-3" /> None
          </Badge>
        );
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const formatModule = (mod: string) => {
    return mod.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
      <CardHeader className="border-b border-zinc-800 bg-zinc-900/20">
        <CardTitle>RBAC Matrix</CardTitle>
        <CardDescription>Live enforcement rules mapped dynamically from the backend.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Role</th>
              {modules.map(mod => (
                <th key={mod} className="px-6 py-4 font-medium">{formatModule(mod)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-zinc-300">
            {roles.map(role => (
              <tr key={role} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-200 whitespace-nowrap">
                  {formatRole(role)}
                </td>
                {modules.map(mod => (
                  <td key={`${role}-${mod}`} className="px-6 py-4 whitespace-nowrap">
                    {renderBadge(matrix[role][mod])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
