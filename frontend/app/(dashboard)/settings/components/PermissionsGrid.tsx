import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Save } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/auth-store';

type PermissionLevel = 'none' | 'view' | 'full';

interface PermissionsMatrix {
  [role: string]: {
    [resource: string]: PermissionLevel;
  };
}

export function PermissionsGrid() {
  const [matrix, setMatrix] = useState<PermissionsMatrix | null>(null);
  const [originalMatrix, setOriginalMatrix] = useState<PermissionsMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuthStore();

  const fetchMatrix = async () => {
    try {
      const res = await apiFetch('/permissions');
      setMatrix(JSON.parse(JSON.stringify(res.data.matrix)));
      setOriginalMatrix(JSON.parse(JSON.stringify(res.data.matrix)));
    } catch (err) {
      toast.error('Failed to load permissions matrix');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const hasChanges = () => {
    if (!matrix || !originalMatrix) return false;
    for (const role in matrix) {
      for (const resource in matrix[role]) {
        if (matrix[role][resource] !== originalMatrix[role][resource]) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (!matrix || !originalMatrix) return;
    
    setIsSaving(true);
    const updates: { role: string; module: string; access: string }[] = [];
    
    for (const role in matrix) {
      for (const resource in matrix[role]) {
        if (matrix[role][resource] !== originalMatrix[role][resource]) {
          updates.push({ role, module: resource, access: matrix[role][resource].toUpperCase() });
        }
      }
    }

    try {
      await apiFetch('/permissions/bulk', {
        method: 'PUT',
        body: JSON.stringify({ updates })
      });
      
      toast.success('Permissions updated successfully!');
      setShowConfirm(false);
      await fetchMatrix();
      
      // If the current user's role was affected, refresh the page to reload permissions
      if (updates.some(u => u.role === user?.role)) {
        window.location.reload();
      }
    } catch (err) {
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellChange = (role: string, resource: string, value: string) => {
    if (matrix) {
      const newMatrix = { ...matrix };
      newMatrix[role][resource] = value as PermissionLevel;
      setMatrix(newMatrix);
    }
  };

  const getPermissionBadge = (level: PermissionLevel) => {
    switch (level.toLowerCase()) {
      case 'full':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> Full</span>;
      case 'view':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> View</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md"><XCircle className="w-3 h-3"/> None</span>;
    }
  };

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl h-full flex flex-col relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>
                Live matrix of enforcement rules directly from the backend.
              </CardDescription>
            </div>
            {hasChanges() && (
              <Button onClick={() => setShowConfirm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-x-auto pb-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : matrix ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Module</th>
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
                      <td key={`${role}-${resource}`} className="px-4 py-3 text-center">
                        {role === 'FLEET_MANAGER' ? (
                          getPermissionBadge(matrix[role][resource])
                        ) : (
                          <Select 
                            value={matrix[role][resource]} 
                            onValueChange={(val) => handleCellChange(role, resource, val as string)}
                          >
                            <SelectTrigger className={`w-28 h-8 mx-auto text-xs ${matrix[role][resource] !== originalMatrix![role][resource] ? 'border-orange-500/50 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              <SelectItem value="none" className="text-xs focus:bg-zinc-800"><XCircle className="w-3 h-3 inline mr-1 text-zinc-500"/> None</SelectItem>
                              <SelectItem value="view" className="text-xs focus:bg-zinc-800"><CheckCircle2 className="w-3 h-3 inline mr-1 text-blue-500"/> View</SelectItem>
                              <SelectItem value="full" className="text-xs focus:bg-zinc-800"><CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500"/> Full</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
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

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Permission Changes</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You are about to modify system access roles. These changes take effect immediately for all active sessions. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSaving} className="border-zinc-800 bg-transparent hover:bg-zinc-900">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
