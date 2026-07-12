'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';

const completeSchema = z.object({
  finalOdometerKm: z.coerce.number().min(0, 'Must be positive'),
  fuelConsumedLiters: z.coerce.number().positive('Must be positive'),
  fuelCost: z.coerce.number().positive('Must be positive'),
  revenue: z.coerce.number().min(0, 'Must be positive').optional(),
});

type CompleteFormValues = z.infer<typeof completeSchema>;

interface CompleteTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompleteFormValues) => Promise<{ success: boolean; error?: string }>;
  tripCode?: string;
}

export function CompleteTripDialog({ open, onOpenChange, onSubmit, tripCode }: CompleteTripDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      finalOdometerKm: 0,
      fuelConsumedLiters: 0,
      fuelCost: 0,
      revenue: 0,
    }
  });

  const handleSubmit = async (data: CompleteFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle>Complete Trip {tripCode}</DialogTitle>
          <DialogDescription>Submit final metrics to recalculate ROI and free assets.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            {errorMsg && (
              <RuleHintBanner text={errorMsg} type="error" />
            )}
            
            <FormField
              control={form.control}
              name="finalOdometerKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Odometer (km)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-zinc-950 border-zinc-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuelConsumedLiters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Consumed (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-zinc-950 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-zinc-950 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue ($) (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} className="bg-zinc-950 border-zinc-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? 'Submitting...' : 'Complete Trip'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
