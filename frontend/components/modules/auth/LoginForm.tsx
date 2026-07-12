'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setErrorMsg(null);
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        login(response.data.user, response.data.accessToken);
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.status === 423) {
        setErrorMsg('Invalid credentials — Account locked after 5 failed attempts.');
      } else {
        setErrorMsg('Invalid credentials');
      }
    }
  };

  const handleDevFill = (role: string) => {
    const map: Record<string, string> = {
      FLEET_MANAGER: 'fleet@transitops.com',
      DRIVER: 'driver@transitops.com',
      SAFETY_OFFICER: 'safety@transitops.com',
      FINANCIAL_ANALYST: 'finance@transitops.com',
    };
    if (map[role]) {
      form.setValue('email', map[role]);
      form.setValue('password', 'password123'); // From seed
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">Welcome back</h2>
        <p className="text-zinc-400 text-sm">Enter your credentials to sign in to your account</p>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="border-red-900/50 bg-red-950/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">Email</Label>
          <Input 
            id="email" 
            placeholder="name@transitops.com" 
            className="bg-zinc-900 border-zinc-800 text-zinc-100" 
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <p className="text-sm font-medium text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <button type="button" className="text-xs text-amber-500 hover:text-amber-400">
              Forgot password?
            </button>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="bg-zinc-900 border-zinc-800 text-zinc-100" 
            {...form.register('password')} 
          />
          {form.formState.errors.password && (
            <p className="text-sm font-medium text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-medium" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* Dev Mode Role Selector */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="pt-6 mt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Dev Mode: Auto-fill Role</p>
          <Select onValueChange={handleDevFill}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-400">
              <SelectValue placeholder="Select a role to test..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
              <SelectItem value="DRIVER">Driver</SelectItem>
              <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
              <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
