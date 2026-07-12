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

  return (
    <>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
        {trips.map(trip => (
          <Card key={trip.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-300 font-semibold">{trip.tripCode}</span>
                  <button onClick={() => setSelectedTrip(trip)} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="View Details">
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer" onClick={() => setSelectedTrip(trip)}>
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{trip.source} &rarr; {trip.destination}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800 cursor-pointer" onClick={() => setSelectedTrip(trip)}>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3 shrink-0" />
                  <span className="truncate">{trip.vehicle?.regNo || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{trip.driver?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => onComplete(trip)}>
                  Complete
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3" onClick={() => onCancel(trip)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Trip Details</span>
              {selectedTrip && <StatusBadge status={selectedTrip.status} />}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTrip && (
            <div className="space-y-6 pt-4">
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
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Created At</div>
                    <div className="text-sm">{new Date(selectedTrip.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Dispatched At</div>
                    <div className="text-sm">{selectedTrip.dispatchedAt ? new Date(selectedTrip.dispatchedAt).toLocaleDateString() : 'N/A'}</div>
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
                  {selectedTrip.vehicle && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Capacity</div>
                      <div className="font-mono text-sm">{selectedTrip.vehicle.capacityKg.toLocaleString()} kg</div>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-400" />
                    <div>
                      <div className="text-sm font-medium">{selectedTrip.driver?.name || 'Unassigned'}</div>
                      <div className="text-xs text-zinc-500">{selectedTrip.driver?.licenseNo}</div>
                    </div>
                  </div>
                  {selectedTrip.driver && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">License Class</div>
                      <div className="font-semibold text-sm">{selectedTrip.driver.licenseCategory}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
