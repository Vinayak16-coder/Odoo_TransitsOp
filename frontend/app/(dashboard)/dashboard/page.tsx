'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { FilterBar } from '@/components/shared/FilterBar';
import { RecentTripsTable, Trip } from './components/RecentTripsTable';
import { VehicleStatusBar } from './components/VehicleStatusBar';
import { Truck, Activity, Wrench, Route, MapPin, Users, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.allSettled([
          apiFetch('/analytics/dashboard'),
          apiFetch('/trips?limit=5')
        ]);
        
        const [dashRes, tripsRes] = results;
        
        if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);
        if (tripsRes.status === 'fulfilled') setTrips(tripsRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-zinc-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-400">Overview of your fleet operations.</p>
      </div>

      <FilterBar 
        filters={[
          {
            key: 'region',
            label: 'Region',
            value: regionFilter,
            onChange: setRegionFilter,
            options: [
              { label: 'All Regions', value: 'all' },
              { label: 'North Hub', value: 'north' },
              { label: 'South Hub', value: 'south' }
            ]
          }
        ]}
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatCard title="Active Vehicles" value={stats.activeVehicles} icon={<Truck className="h-4 w-4" />} accentColor="border-blue-500" />
          <StatCard title="Available Vehicles" value={stats.availableVehicles} icon={<Activity className="h-4 w-4" />} accentColor="border-green-500" />
          <StatCard title="In Maintenance" value={stats.inShopVehicles} icon={<Wrench className="h-4 w-4" />} accentColor="border-amber-500" />
          <StatCard title="Active Trips" value={stats.activeTrips} icon={<Route className="h-4 w-4" />} accentColor="border-blue-500" />
          <StatCard title="Pending Trips" value={stats.pendingTrips} icon={<MapPin className="h-4 w-4" />} accentColor="border-amber-500" />
          <StatCard title="Drivers on Duty" value={stats.driversOnDuty} icon={<Users className="h-4 w-4" />} accentColor="border-blue-500" />
          <StatCard title="Utilization %" value={`${stats.fleetUtilizationPct}%`} icon={<Percent className="h-4 w-4" />} accentColor="border-purple-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-200">Recent Trips</h2>
          <RecentTripsTable trips={trips} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-200">Fleet Status</h2>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="pt-6">
              {stats && (
                <VehicleStatusBar 
                  available={stats.availableVehicles}
                  onTrip={stats.activeVehicles}
                  inShop={stats.inShopVehicles}
                  total={stats.activeVehicles + stats.availableVehicles + stats.inShopVehicles}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
