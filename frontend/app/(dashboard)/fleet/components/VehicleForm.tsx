'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { RuleHintBanner } from '@/components/shared/RuleHintBanner';

const vehicleSchema = z.object({
  regNo: z.string().min(1, 'Registration number is required'),
  nameModel: z.string().min(1, 'Model name is required'),
  type: z.enum(['VAN', 'LIGHT_TRUCK', 'HEAVY_TRUCK', 'FLATBED', 'REFRIGERATED']),
  capacityKg: z.coerce.number().positive('Capacity must be a positive number'),
  acquisitionCost: z.coerce.number().positive('Acquisition cost must be strictly greater than 0'),
  region: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialData?: Partial<VehicleFormValues>;
  onSubmit: (data: VehicleFormValues) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      regNo: initialData?.regNo || '',
      nameModel: initialData?.nameModel || '',
      type: initialData?.type || 'VAN',
      capacityKg: initialData?.capacityKg || 0,
      acquisitionCost: initialData?.acquisitionCost || 0,
      region: initialData?.region || '',
    },
  });

  const handleSubmit = async (data: VehicleFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {errorMsg && (
          <RuleHintBanner text={errorMsg} type="error" />
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="regNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration No.</FormLabel>
                <FormControl>
                  <Input placeholder="OPS-V-001" disabled={!!initialData} {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name / Model</FormLabel>
                <FormControl>
                  <Input placeholder="Ford Transit" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VAN">Van</SelectItem>
                    <SelectItem value="LIGHT_TRUCK">Light Truck</SelectItem>
                    <SelectItem value="HEAVY_TRUCK">Heavy Truck</SelectItem>
                    <SelectItem value="FLATBED">Flatbed</SelectItem>
                    <SelectItem value="REFRIGERATED">Refrigerated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input placeholder="North Hub" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacityKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="acquisitionCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acquisition Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" disabled={!!initialData} {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-zinc-950">
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Vehicle')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
