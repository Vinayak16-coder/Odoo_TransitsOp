'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { RevenueChart } from './components/RevenueChart';
import { CostliestVehicles } from './components/CostliestVehicles';
import { ExportSection } from './components/ExportSection';
import { RoleGate } from '@/components/shared/RoleGate';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [costliest, setCostliest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [kpisRes, revRes, costRes] = await Promise.all([
        apiFetch('/analytics/kpis'),
        apiFetch('/analytics/monthly-revenue'),
        apiFetch('/analytics/top-costliest-vehicles'),
      ]);
      setKpis(kpisRes.data);
      setRevenue(revRes.data);
      setCostliest(costRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Analytics & Reports</h1>
        <p className="text-sm text-zinc-400">Deep-dive into fleet performance and financial health.</p>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Top Row: KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Fuel Efficiency" 
              value={`${kpis?.fuelEfficiency || 0}`} 
              description="Global km per liter" 
              trend={{ value: 2.1, isPositive: true }}
            />
            <StatCard 
              title="Fleet Utilization" 
              value={`${kpis?.fleetUtilizationPct || 0}%`} 
              description="Active / Total Fleet" 
            />
            <StatCard 
              title="Operational Cost" 
              value={`$${(kpis?.operationalCost || 0).toLocaleString()}`} 
              description="Fuel & Maintenance spend" 
              trend={{ value: 5.4, isPositive: false }}
            />
            <StatCard 
              title="Avg Vehicle ROI" 
              value={`${kpis?.avgVehicleROI || 0}%`} 
              description="Revenue vs Acquisition" 
              trend={{ value: 1.2, isPositive: true }}
            />
          </div>

          {/* Middle Row: Revenue Chart */}
          <div className="w-full">
            <RevenueChart data={revenue} />
          </div>

          {/* Bottom Row: Costliest Vehicles & Export */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CostliestVehicles data={costliest} />
            
            <RoleGate allow={['FINANCIAL_ANALYST', 'FLEET_MANAGER']}>
              <ExportSection />
            </RoleGate>
          </div>
          
        </div>
      )}
    </div>
  );
}
