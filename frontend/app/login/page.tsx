import LoginForm from '@/components/modules/auth/LoginForm';
import { ShieldCheck, Truck, Users, Activity } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Panel - Branding & Info */}
      <div className="md:w-5/12 p-10 flex flex-col justify-between bg-zinc-900/50 border-r border-zinc-800">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded bg-amber-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-zinc-950" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">TransitOps</h1>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-semibold text-zinc-100">One login, four roles.</h2>
            <p className="text-zinc-400 text-lg">
              Smart Transport Operations Platform. Access is scoped by role after login to ensure security and streamlined workflows.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <Users className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-200">Fleet Manager</h3>
                  <p className="text-sm text-zinc-500">Full system access & dispatch</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <Truck className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-200">Driver</h3>
                  <p className="text-sm text-zinc-500">View trips & update status</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-200">Safety Officer</h3>
                  <p className="text-sm text-zinc-500">Manage compliance & drivers</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <Activity className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-200">Financial Analyst</h3>
                  <p className="text-sm text-zinc-500">Track fuel, expenses & ROI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-7/12 flex flex-col items-center justify-center p-6 bg-zinc-950">
        <div className="w-full max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
