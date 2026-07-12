'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';

const logFuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  liters: z.coerce.number().positive('Must be positive'),
  cost: z.coerce.number().positive('Must be positive'),
});

type LogFuelFormValues = z.infer<typeof logFuelSchema>;

interface LogFuelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  trips: any[];
  onSubmit: (data: LogFuelFormValues) => Promise<{ success: boolean; error?: string }>;
}

export function LogFuelDialog({ open, onOpenChange, vehicles, trips, onSubmit }: LogFuelDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LogFuelFormValues>({
    resolver: zodResolver(logFuelSchema),
    defaultValues: {
      vehicleId: '',
      tripId: 'none',
      date: new Date().toISOString().split('T')[0],
      liters: 0,
      cost: 0,
    }
  });

  const handleSubmit = async (data: LogFuelFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tripId: data.tripId === 'none' ? undefined : data.tripId,
        date: new Date(data.date).toISOString()
      };
      const result = await onSubmit(payload);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        form.reset();
        onOpenChange(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle>Log Fuel</DialogTitle>
          <DialogDescription>Record standalone refueling events.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
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
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.regNo}
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
              name="tripId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Trip (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Select trip" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      <SelectItem value="none">None</SelectItem>
                      {trips.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.tripCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (Liters)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="bg-zinc-900 border-zinc-800" />
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
              name="date"
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? 'Saving...' : 'Log Fuel'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
