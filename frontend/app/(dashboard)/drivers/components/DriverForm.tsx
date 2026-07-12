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

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNo: z.string().min(1, 'License number is required'),
  licenseCategory: z.enum(['LMV', 'HMV']),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  contact: z.string().regex(/^\d{10}$/, 'Mobile phone must be exactly 10 digits'),
});

type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverFormProps {
  initialData?: Partial<DriverFormValues>;
  onSubmit: (data: DriverFormValues) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function DriverForm({ initialData, onSubmit, onCancel }: DriverFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse initial date from ISO string to YYYY-MM-DD for the HTML date input
  let defaultExpiry = '';
  if (initialData?.licenseExpiry) {
    defaultExpiry = new Date(initialData.licenseExpiry).toISOString().split('T')[0];
  }

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: initialData?.name || '',
      licenseNo: initialData?.licenseNo || '',
      licenseCategory: initialData?.licenseCategory || 'LMV',
      licenseExpiry: defaultExpiry,
      contact: initialData?.contact || '',
    },
  });

  const handleSubmit = async (data: DriverFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Backend expects an ISO datetime string
      const isoDate = new Date(data.licenseExpiry).toISOString();
      const payload = { ...data, licenseExpiry: isoDate };

      const result = await onSubmit(payload);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Info</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="licenseNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License No.</FormLabel>
                <FormControl>
                  <Input placeholder="LIC-12345" disabled={!!initialData} {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="licenseCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LMV">LMV</SelectItem>
                    <SelectItem value="HMV">HMV</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseExpiry"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>License Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-zinc-950 border-zinc-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-zinc-950">
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Driver')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
