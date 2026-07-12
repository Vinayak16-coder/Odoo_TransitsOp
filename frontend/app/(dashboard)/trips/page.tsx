'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CreateTripCard } from './components/CreateTripCard';
import { LiveBoard } from './components/LiveBoard';
import { CompleteTripDialog } from './components/CompleteTripDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Trip } from '../dashboard/components/RecentTripsTable';
import { Vehicle } from '../fleet/components/VehicleTable';
import { Driver } from '../drivers/components/DriverTable';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [cancelingTrip, setCancelingTrip] = useState<Trip | null>(null);

  const loadData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        apiFetch('/trips?status=DISPATCHED'), // Active board
        apiFetch('/vehicles?status=AVAILABLE'),
        apiFetch('/drivers?status=AVAILABLE'),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async (data: any) => {
    try {
      // Step 1: Create
      const tripRes = await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          source: data.source,
          destination: data.destination,
          cargoWeightKg: data.cargoWeightKg,
          plannedDistanceKm: data.plannedDistanceKm,
        })
      });
      const tripId = tripRes.data.id;

      // Step 2: Assign
      await apiFetch(`/trips/${tripId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({
          vehicleId: data.vehicleId,
          driverId: data.driverId,
        })
      });

      // Step 3: Dispatch
      await apiFetch(`/trips/${tripId}/dispatch`, {
        method: 'PATCH',
      });

      await loadData(); // Reload to show new trip on board & remove assets from selects
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Dispatch failed' };
    }
  };

  const handleComplete = async (data: any) => {
    if (!completingTrip) return { success: false };
    try {
      await apiFetch(`/trips/${completingTrip.id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      setCompletingTrip(null);
      await loadData(); // Reload board & return assets to selects
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Complete failed' };
    }
  };

  const handleCancel = async () => {
    if (!cancelingTrip) return;
    try {
      await apiFetch(`/trips/${cancelingTrip.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ cancelReason: 'Canceled via Live Board' })
      });
      setCancelingTrip(null);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Dispatch & Live Trips</h1>
        <p className="text-sm text-zinc-400">Orchestrate routes and monitor active operations in real-time.</p>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading command center...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left Column: Create Trip */}
          <div className="lg:col-span-2">
            <CreateTripCard 
              vehicles={vehicles}
              drivers={drivers}
              onDispatch={handleDispatch}
            />
          </div>

          {/* Right Column: Live Board */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Live Board (Active Trips)</h2>
            <LiveBoard 
              trips={trips}
              onComplete={setCompletingTrip}
              onCancel={setCancelingTrip}
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CompleteTripDialog 
        open={!!completingTrip}
        onOpenChange={(open) => !open && setCompletingTrip(null)}
        onSubmit={handleComplete}
        tripCode={completingTrip?.tripCode}
      />

      <ConfirmDialog 
        open={!!cancelingTrip}
        onOpenChange={(open) => !open && setCancelingTrip(null)}
        title="Cancel Trip?"
        description={`Are you sure you want to cancel ${cancelingTrip?.tripCode}? This will revert the trip status to CANCELLED and immediately free the assigned vehicle and driver.`}
        confirmText="Cancel Trip"
        destructive
        onConfirm={handleCancel}
      />
    </div>
  );
}
