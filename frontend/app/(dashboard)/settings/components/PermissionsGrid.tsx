import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

type PermissionLevel = 'none' | 'read' | 'write' | 'full';

interface PermissionsMatrix {
  [role: string]: {
    [resource: string]: PermissionLevel;
  };
}

export function PermissionsGrid() {
  const [matrix, setMatrix] = useState<PermissionsMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get('/users/permissions-matrix');
        setMatrix(res.data.matrix);
      } catch (err) {
        toast.error('Failed to load permissions matrix');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  const getPermissionBadge = (level: PermissionLevel) => {
    switch (level) {
      case 'full':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> Full</span>;
      case 'write':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> Write</span>;
      case 'read':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> Read</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md"><XCircle className="w-3 h-3"/> None</span>;
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Role-Based Access Control
        </CardTitle>
        <CardDescription>
          Live matrix of enforcement rules directly from the backend. (Read-only)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : matrix ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Resource</th>
                {Object.keys(matrix).map(role => (
                  <th key={role} className="px-4 py-3 font-medium text-center">
                    {role.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {Object.keys(Object.values(matrix)[0] || {}).map(resource => (
                <tr key={resource} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-4 py-4 font-medium text-zinc-200">{resource}</td>
                  {Object.keys(matrix).map(role => (
                    <td key={`${role}-${resource}`} className="px-4 py-4 text-center">
                      {getPermissionBadge(matrix[role][resource])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-40 items-center justify-center text-zinc-500">
            No matrix data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
