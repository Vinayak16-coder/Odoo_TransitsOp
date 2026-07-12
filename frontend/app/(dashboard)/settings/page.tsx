'use client';

import { RoleGate } from '@/components/shared/RoleGate';
import { GeneralSettings } from './components/GeneralSettings';
import { PermissionsGrid } from './components/PermissionsGrid';
import { Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <RoleGate allow={['FLEET_MANAGER']}>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-zinc-100">System Settings</h1>
          </div>
          <p className="text-sm text-zinc-400">Configure global platform defaults and review security matrices.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <GeneralSettings />
          </div>
          
          <div className="xl:col-span-2">
            <PermissionsGrid />
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
