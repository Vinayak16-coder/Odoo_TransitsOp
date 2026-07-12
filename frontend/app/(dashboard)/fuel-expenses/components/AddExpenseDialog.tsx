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

const expenseSchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  category: z.enum(['TOLL', 'MISC', 'FUEL']),
  toll: z.coerce.number().min(0, 'Must be positive').default(0),
  other: z.coerce.number().min(0, 'Must be positive').default(0),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  trips: any[];
  onSubmit: (data: ExpenseFormValues) => Promise<{ success: boolean; error?: string }>;
}

export function AddExpenseDialog({ open, onOpenChange, vehicles, trips, onSubmit }: AddExpenseDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicleId: 'none',
      tripId: 'none',
      category: 'TOLL',
      toll: 0,
      other: 0,
    }
  });

  const handleSubmit = async (data: ExpenseFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        vehicleId: data.vehicleId === 'none' ? undefined : data.vehicleId,
        tripId: data.tripId === 'none' ? undefined : data.tripId,
      };
      const result = await onSubmit(payload as ExpenseFormValues);
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
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record miscellaneous operational costs.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            {errorMsg && (
              <RuleHintBanner text={errorMsg} type="error" />
            )}
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      <SelectItem value="TOLL">Toll</SelectItem>
                      <SelectItem value="FUEL">Fuel</SelectItem>
                      <SelectItem value="MISC">Misc</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="none">None</SelectItem>
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
                    <FormLabel>Link to Trip</FormLabel>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="toll"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toll ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="other"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-zinc-900 border-zinc-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? 'Saving...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
