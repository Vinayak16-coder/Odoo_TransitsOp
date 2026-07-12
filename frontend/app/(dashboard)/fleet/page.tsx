'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { FilterBar } from '@/components/shared/FilterBar';
import { RoleGate } from '@/components/shared/RoleGate';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VehicleTable, Vehicle } from './components/VehicleTable';
import { VehicleForm } from './components/VehicleForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [retireDialogState, setRetireDialogState] = useState<{ open: boolean; vehicle: Vehicle | null }>({ open: false, vehicle: null });
  const [statusDialogState, setStatusDialogState] = useState<{ open: boolean; vehicle: Vehicle | null; newStatus: string }>({ open: false, vehicle: null, newStatus: '' });

  const loadVehicles = async () => {
    try {
      const res = await apiFetch('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingVehicle) {
        await apiFetch(`/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        await apiFetch('/vehicles', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
      await loadVehicles();
      setIsFormOpen(false);
      return { success: true };
    } catch (err: any) {
      if (err.status === 409) {
        return { success: false, error: 'Rule: Registration No. must be unique.' };
      }
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const handleRetire = async () => {
    if (!retireDialogState.vehicle) return;
    try {
      await apiFetch(`/vehicles/${retireDialogState.vehicle.id}`, { method: 'DELETE' });
      await loadVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusDialogState.vehicle || !statusDialogState.newStatus) return;
    try {
      await apiFetch(`/vehicles/${statusDialogState.vehicle.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusDialogState.newStatus, reason: 'Manual override via Fleet UI' })
      });
      await loadVehicles();
      setStatusDialogState({ open: false, vehicle: null, newStatus: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const typeMatch = typeFilter === 'all' || v.type === typeFilter;
    const statusMatch = statusFilter === 'all' || v.status === statusFilter;
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Vehicle Registry</h1>
        <p className="text-sm text-zinc-400">Manage the fleet, capacities, and acquisition costs.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterBar 
          filters={[
            {
              key: 'type', label: 'Vehicle Type', value: typeFilter, onChange: setTypeFilter,
              options: [
                { label: 'All Types', value: 'all' },
                { label: 'Van', value: 'VAN' },
                { label: 'Light Truck', value: 'LIGHT_TRUCK' },
                { label: 'Heavy Truck', value: 'HEAVY_TRUCK' },
                { label: 'Flatbed', value: 'FLATBED' },
                { label: 'Refrigerated', value: 'REFRIGERATED' }
              ]
            },
            {
              key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'On Trip', value: 'ON_TRIP' },
                { label: 'In Shop', value: 'IN_SHOP' },
                { label: 'Retired', value: 'RETIRED' }
              ]
            }
          ]}
        />

        <RoleGate allow={['FLEET_MANAGER']}>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold"
            onClick={() => { setEditingVehicle(null); setIsFormOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        </RoleGate>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading registry...</div>
      ) : (
        <div className="space-y-4">
          <VehicleTable 
            vehicles={filteredVehicles}
            onEdit={(v) => { setEditingVehicle(v); setIsFormOpen(true); }}
            onChangeStatus={(v) => setStatusDialogState({ open: true, vehicle: v, newStatus: v.status })}
            onRetire={(v) => setRetireDialogState({ open: true, vehicle: v })}
          />
          <RuleHintBanner text="Rule: Registration No. must be unique. Retired/In Shop vehicles are hidden from Trip Dispatcher." type="info" />
        </div>
      )}

      {/* Forms & Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}</DialogTitle>
            <DialogDescription>Acquisition cost is required for ROI calculations.</DialogDescription>
          </DialogHeader>
          <VehicleForm 
            initialData={editingVehicle || undefined}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={retireDialogState.open}
        onOpenChange={(open) => setRetireDialogState({ open, vehicle: retireDialogState.vehicle })}
        title="Retire Vehicle?"
        description={`Are you sure you want to retire ${retireDialogState.vehicle?.regNo}? This soft-deletes the vehicle, preserving historical trips and expenses, but permanently removes it from the active dispatch pool.`}
        confirmText="Retire"
        destructive
        onConfirm={handleRetire}
      />

      <Dialog open={statusDialogState.open} onOpenChange={(open) => setStatusDialogState({ ...statusDialogState, open })}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200 max-w-sm">
          <DialogHeader>
            <DialogTitle>Override Status</DialogTitle>
            <DialogDescription>Manually force the status for {statusDialogState.vehicle?.regNo}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Select value={statusDialogState.newStatus} onValueChange={(val) => setStatusDialogState({ ...statusDialogState, newStatus: val })}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="IN_SHOP">In Shop</SelectItem>
                <SelectItem value="ON_TRIP">On Trip</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogState({ ...statusDialogState, open: false })}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950" onClick={handleChangeStatus}>Save Status</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
