'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { FilterBar } from '@/components/shared/FilterBar';
import { RoleGate } from '@/components/shared/RoleGate';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DriverTable, Driver } from './components/DriverTable';
import { DriverForm } from './components/DriverForm';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [statusDialogState, setStatusDialogState] = useState<{ open: boolean; driver: Driver | null; newStatus: string }>({ open: false, driver: null, newStatus: '' });

  const loadDrivers = async () => {
    try {
      const res = await apiFetch('/drivers');
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingDriver) {
        await apiFetch(`/drivers/${editingDriver.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        await apiFetch('/drivers', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
      await loadDrivers();
      setIsFormOpen(false);
      return { success: true };
    } catch (err: any) {
      if (err.status === 409) {
        return { success: false, error: 'License number must be unique.' };
      }
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const handleChangeStatus = async () => {
    if (!statusDialogState.driver || !statusDialogState.newStatus) return;
    try {
      await apiFetch(`/drivers/${statusDialogState.driver.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusDialogState.newStatus, reason: 'Manual override via Drivers UI' })
      });
      await loadDrivers();
      setStatusDialogState({ open: false, driver: null, newStatus: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuspend = (d: Driver) => {
    setStatusDialogState({ open: true, driver: d, newStatus: 'SUSPENDED' });
  };

  const filteredDrivers = drivers.filter(d => statusFilter === 'all' || d.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Drivers & Safety Profiles</h1>
        <p className="text-sm text-zinc-400">Manage personnel, licenses, and safety statuses.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterBar 
          filters={[
            {
              key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'On Trip', value: 'ON_TRIP' },
                { label: 'Off Duty', value: 'OFF_DUTY' },
                { label: 'Suspended', value: 'SUSPENDED' }
              ]
            }
          ]}
        />

        <RoleGate allow={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold"
            onClick={() => { setEditingDriver(null); setIsFormOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Driver
          </Button>
        </RoleGate>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading drivers...</div>
      ) : (
        <div className="space-y-4">
          <DriverTable 
            drivers={filteredDrivers}
            onEdit={(d) => { setEditingDriver(d); setIsFormOpen(true); }}
            onChangeStatus={(d) => setStatusDialogState({ open: true, driver: d, newStatus: d.status })}
            onSuspend={handleSuspend}
          />
          
          <div className="flex items-center gap-6 mt-4 mb-2">
            <span className="text-sm text-zinc-500 font-medium">Status Legend:</span>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-green-500" /> Available
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-blue-500" /> On Trip
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-zinc-500" /> Off Duty
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-red-500" /> Suspended
            </div>
          </div>

          <RuleHintBanner text="Rule: Expired license or Suspended status → blocked from trip assignment." type="warning" />
        </div>
      )}

      {/* Forms & Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver Details' : 'Register New Driver'}</DialogTitle>
            <DialogDescription>Ensure the license expiry date is accurate.</DialogDescription>
          </DialogHeader>
          <DriverForm 
            initialData={editingDriver || undefined}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogState.open} onOpenChange={(open) => setStatusDialogState({ ...statusDialogState, open })}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200 max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Driver Status</DialogTitle>
            <DialogDescription>Update the duty status for {statusDialogState.driver?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Select value={statusDialogState.newStatus} onValueChange={(val) => setStatusDialogState({ ...statusDialogState, newStatus: val })}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                <SelectItem value="ON_TRIP">On Trip</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogState({ ...statusDialogState, open: false })}>Cancel</Button>
              <Button className={statusDialogState.newStatus === 'SUSPENDED' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-zinc-950'} onClick={handleChangeStatus}>
                Save Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
