'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, User, Info, Package, Map, Calendar, Scale } from 'lucide-react';
import { Trip } from '../../dashboard/components/RecentTripsTable';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LiveBoardProps {
  trips: Trip[];
  onComplete: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
}

export function LiveBoard({ trips, onComplete, onCancel }: LiveBoardProps) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  if (trips.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-zinc-800 rounded-lg text-zinc-500">
        No active trips on the board.
      </div>
    );
  }

  const getMetaText = (trip: Trip) => {
    if (trip.status === 'DRAFT') {
      return !trip.driverId || !trip.vehicleId ? 'Awaiting resources' : 'Ready to dispatch';
    }
    if (trip.status === 'DISPATCHED') {
      const estimatedHours = trip.plannedDistanceKm / 60;
      return `ETA: ~${Math.ceil(estimatedHours)}h`;
    }
    if (trip.status === 'CANCELLED') return trip.cancelReason || 'No reason provided';
    return '';
  };

  const STEPS = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

  const getStepStatus = (tripStatus: string, stepIndex: number) => {
    if (tripStatus === 'CANCELLED') {
      if (stepIndex === 0) return 'passed';
      if (stepIndex === 3) return 'current';
      return 'upcoming'; // 1 and 2 are skipped
    }
    const currentIdx = STEPS.indexOf(tripStatus);
    if (stepIndex < currentIdx) return 'passed';
    if (stepIndex === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
        {trips.map(trip => (
          <Card key={trip.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setSelectedTrip(trip)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-100">{trip.tripCode}</span>
                <span className="text-xs font-mono text-zinc-400">
                  {trip.vehicle ? `${trip.vehicle.regNo} / ${trip.driver?.name || 'Unassigned'}` : 'Unassigned'}
                </span>
              </div>
              
              <div className="text-sm text-zinc-300 font-medium">
                {trip.source} &rarr; {trip.destination}
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <StatusBadge status={trip.status} />
                <span className="text-xs text-zinc-500 font-medium">
                  {getMetaText(trip)}
                </span>
              </div>

              {trip.status === 'DRAFT' && (
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => onComplete(trip)}>
                    Dispatch
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3" onClick={() => onCancel(trip)}>
                    Cancel
                  </Button>
                </div>
              )}
              {trip.status === 'DISPATCHED' && (
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="flex-1 border-emerald-500/50 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => onComplete(trip)}>
                    Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Trip {selectedTrip?.tripCode}</span>
              {selectedTrip && <StatusBadge status={selectedTrip.status} />}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTrip && (
            <div className="space-y-6 pt-4">
              {/* Stepper */}
              <div className="relative py-4">
                <div className="absolute top-[28px] left-[12%] right-[12%] h-[2px] bg-zinc-800 z-0"></div>
                <div className="flex justify-between items-center relative z-10">
                  {STEPS.map((step, idx) => {
                    const status = getStepStatus(selectedTrip.status, idx);
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 w-1/4">
                        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          status === 'passed' ? 'bg-emerald-500 border-emerald-500' :
                          status === 'current' ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20' :
                          'bg-zinc-900 border-zinc-700'
                        }`} />
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                          status === 'passed' || status === 'current' ? 'text-zinc-200' : 'text-zinc-600'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Route</div>
                    <div className="font-medium">{selectedTrip.source} &rarr; {selectedTrip.destination}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Map className="h-4 w-4 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Planned Distance</div>
                    <div className="font-mono text-sm">{selectedTrip.plannedDistanceKm.toLocaleString()} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Cargo Weight</div>
                    <div className="font-mono text-sm">{selectedTrip.cargoWeightKg.toLocaleString()} kg</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Assigned Resources</h4>
                <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-zinc-400" />
                    <div>
                      <div className="text-sm font-mono font-medium">{selectedTrip.vehicle?.regNo || 'Unassigned'}</div>
                      <div className="text-xs text-zinc-500">{selectedTrip.vehicle?.nameModel}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-400" />
                    <div>
                      <div className="text-sm font-medium">{selectedTrip.driver?.name || 'Unassigned'}</div>
                      <div className="text-xs text-zinc-500">{selectedTrip.driver?.licenseNo}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
