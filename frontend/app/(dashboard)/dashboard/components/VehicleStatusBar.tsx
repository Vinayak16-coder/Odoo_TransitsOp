'use client';

interface VehicleStatusBarProps {
  available: number;
  onTrip: number;
  inShop: number;
  total: number;
}

export function VehicleStatusBar({ available, onTrip, inShop, total }: VehicleStatusBarProps) {
  if (total === 0) return null;

  const availablePct = (available / total) * 100;
  const onTripPct = (onTrip / total) * 100;
  const inShopPct = (inShop / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300 font-medium">Fleet Live Status</span>
        <span className="text-zinc-500">{total} Total Vehicles</span>
      </div>
      
      <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden flex">
        <div style={{ width: `${availablePct}%` }} className="bg-green-500 h-full transition-all" title={`Available: ${available}`} />
        <div style={{ width: `${onTripPct}%` }} className="bg-blue-500 h-full transition-all" title={`On Trip: ${onTrip}`} />
        <div style={{ width: `${inShopPct}%` }} className="bg-amber-500 h-full transition-all" title={`In Shop: ${inShop}`} />
      </div>

      <div className="flex items-center gap-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          Available ({available})
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          On Trip ({onTrip})
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          In Shop ({inShop})
        </div>
      </div>
    </div>
  );
}
