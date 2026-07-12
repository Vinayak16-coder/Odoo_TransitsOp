'use client';

import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';

const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  cost: z.coerce.number().nonnegative('Cost must be positive'),
  serviceDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof createMaintenanceSchema>;

interface MaintenanceFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: MaintenanceFormValues) => Promise<{ success: boolean; error?: string }>;
}

export function MaintenanceForm({ vehicles, onSubmit }: MaintenanceFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      vehicleId: '',
      serviceType: '',
      cost: 0,
      serviceDate: new Date().toISOString().split('T')[0],
      notes: '',
    }
  });

  const handleSubmit = async (data: MaintenanceFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Convert HTML date to ISO
      const isoDate = new Date(data.serviceDate).toISOString();
      const payload = { ...data, serviceDate: isoDate };

      const result = await onSubmit(payload);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        form.reset({
          vehicleId: '',
          serviceType: '',
          cost: 0,
          serviceDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
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
        <CardTitle>Log Service Record</CardTitle>
        <CardDescription>File new maintenance reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {errorMsg && (
              <RuleHintBanner text={errorMsg} type="error" />
            )}

            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.regNo} - {v.nameModel}
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
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Oil Change, Brake Replacement" {...field} className="bg-zinc-900 border-zinc-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mechanic remarks..." {...field} className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
                {isSubmitting ? 'Logging...' : 'Log Service Record'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
