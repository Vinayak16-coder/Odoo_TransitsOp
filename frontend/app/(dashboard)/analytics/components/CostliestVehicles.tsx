'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface CostliestVehicle {
  id: string;
  regNo: string;
  nameModel: string;
  avgCostPerKm: number;
}

export function CostliestVehicles({ data }: { data: CostliestVehicle[] }) {
  if (data.length === 0) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle>Costliest Vehicles</CardTitle>
          <CardDescription>Top assets by Average Cost Per Km</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center text-zinc-500">
          No cost data available yet.
        </CardContent>
      </Card>
    );
  }

  const maxCost = Math.max(...data.map(v => v.avgCostPerKm));

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle>Costliest Vehicles</CardTitle>
        <CardDescription>Top assets by Average Cost Per Km (Fuel + Maintenance)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((v, i) => {
            const pct = maxCost > 0 ? (v.avgCostPerKm / maxCost) * 100 : 0;
            return (
              <div key={v.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-end text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-xs w-4">{i + 1}.</span>
                    <Truck className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-200">{v.regNo}</span>
                    <span className="text-zinc-500 hidden sm:inline-block">({v.nameModel})</span>
                  </div>
                  <span className="font-mono text-amber-500 font-semibold">${Number(v.avgCostPerKm).toFixed(2)}/km</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
