'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';
import { Vehicle } from '../../fleet/components/VehicleTable';
import { Driver } from '../../drivers/components/DriverTable';

const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoWeightKg: z.coerce.number().positive('Cargo weight must be positive'),
  plannedDistanceKm: z.coerce.number().positive('Planned distance must be positive'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

interface CreateTripCardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onDispatch: (data: CreateTripFormValues) => Promise<{ success: boolean; error?: string }>;
}

export function CreateTripCard({ vehicles, drivers, onDispatch }: CreateTripCardProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      source: '',
      destination: '',
      cargoWeightKg: 0,
      plannedDistanceKm: 0,
      vehicleId: '',
      driverId: '',
    }
  });

  const selectedVehicleId = useWatch({ control: form.control, name: 'vehicleId' });
  const cargoWeight = useWatch({ control: form.control, name: 'cargoWeightKg' });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  // BR-1 Check
  const isOverCapacity = selectedVehicle && cargoWeight && cargoWeight > selectedVehicle.capacityKg;

  const handleSubmit = async (data: CreateTripFormValues) => {
    if (isOverCapacity) return;
    
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await onDispatch(data);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        form.reset();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle>Create & Dispatch</CardTitle>
        <CardDescription>Setup a new trip and assign resources.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {errorMsg && (
              <RuleHintBanner text={errorMsg} type="error" />
            )}
            
            {selectedVehicle && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400">Vehicle Capacity:</span>
                  <span className="font-mono text-zinc-200">{selectedVehicle.capacityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Remaining Capacity:</span>
                  <span className={`font-mono ${isOverCapacity ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                    {(selectedVehicle.capacityKg - (cargoWeight || 0)).toLocaleString()} kg
                  </span>
                </div>
                {isOverCapacity && (
                  <div className="mt-2 pt-2 border-t border-red-500/20 text-red-500 text-xs font-semibold">
                    Rule: Cargo weight exceeds vehicle capacity (BR-1). Dispatch blocked.
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Hub</FormLabel>
                    <FormControl>
                      <Input placeholder="North Hub" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="South Hub" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cargoWeightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plannedDistanceKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Distance (km)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 mt-4 space-y-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-auto py-2">
                          <SelectValue placeholder="Select an available vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-950 border-zinc-800 w-[350px]">
                        {vehicles.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id} className="cursor-pointer focus:bg-zinc-900 p-2">
                            <div className="flex flex-col gap-1 w-full text-left whitespace-normal pr-4">
                              <div className="flex justify-between items-center w-full gap-4">
                                <span className="font-mono font-medium text-zinc-200">{v.regNo}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full shrink-0 uppercase">{v.status}</span>
                              </div>
                              <div className="text-xs text-zinc-400 flex items-center justify-between gap-4">
                                <span>{v.nameModel}</span>
                                <span className="shrink-0 font-mono text-zinc-500">{v.capacityKg.toLocaleString()} kg</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-auto py-2">
                          <SelectValue placeholder="Select an available driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-950 border-zinc-800 w-[350px]">
                        {drivers.length === 0 && <SelectItem value="none" disabled>No drivers available</SelectItem>}
                        {drivers.map(d => (
                          <SelectItem key={d.id} value={d.id} className="cursor-pointer focus:bg-zinc-900 p-2">
                            <div className="flex flex-col gap-1 w-full text-left whitespace-normal pr-4">
                              <div className="flex justify-between items-center w-full gap-4">
                                <span className="font-medium text-zinc-200">{d.name}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full shrink-0 uppercase">{d.status}</span>
                              </div>
                              <div className="text-xs text-zinc-400 flex items-center justify-between gap-4">
                                <span className="font-mono">{d.licenseNo}</span>
                                <span className="shrink-0 font-semibold text-zinc-500">Class {d.licenseCategory}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
              <Button type="submit" disabled={isSubmitting || !!isOverCapacity} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
                {isSubmitting ? 'Dispatching...' : 'Dispatch Trip'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
