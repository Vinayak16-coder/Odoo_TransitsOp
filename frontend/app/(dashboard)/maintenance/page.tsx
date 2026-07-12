'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MaintenanceForm } from './components/MaintenanceForm';
import { MaintenanceTable, MaintenanceLog } from './components/MaintenanceTable';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';
import { Vehicle } from '../fleet/components/VehicleTable';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        apiFetch('/maintenance'),
        apiFetch('/vehicles'),
      ]);
      setLogs(logsRes.data);
      // Only allow logging maintenance for active vehicles (Available or On Trip)
      const validVehicles = vehiclesRes.data.filter((v: Vehicle) => v.status !== 'RETIRED');
      setVehicles(validVehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await apiFetch('/maintenance', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to log record' };
    }
  };

  const handleMarkComplete = async (log: MaintenanceLog) => {
    try {
      await apiFetch(`/maintenance/${log.id}/complete`, {
        method: 'PATCH'
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Maintenance & Shop</h1>
        <p className="text-sm text-zinc-400">Log service records and manage the repair queue.</p>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading records...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form & Hints */}
          <div className="space-y-6">
            <MaintenanceForm 
              vehicles={vehicles}
              onSubmit={handleCreate}
            />
            
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Asset Lifecycle</h3>
                <div className="flex items-center justify-center gap-4 py-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-center">
                    <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold mb-1">AVAILABLE</div>
                  </div>
                  <ArrowRightLeft className="text-zinc-500 h-5 w-5" />
                  <div className="text-center">
                    <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-semibold mb-1">IN_SHOP</div>
                  </div>
                </div>
                <RuleHintBanner text="Rule: Logging maintenance immediately sets the vehicle to IN_SHOP, removing it from active trip dispatch." type="warning" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Service Log */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Service Log</h2>
            <MaintenanceTable 
              logs={logs}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
