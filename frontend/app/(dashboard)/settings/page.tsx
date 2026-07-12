"use client";

import React from 'react';
import { RoleGate } from '@/components/shared/RoleGate';
import { GeneralSettings } from './components/GeneralSettings';
import { PermissionsGrid } from './components/PermissionsGrid';

export default function SettingsPage() {
  return (
    <RoleGate allow={['FLEET_MANAGER']}>
      <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
          <p className="text-muted-foreground">Manage your depot preferences and role permissions.</p>
        </div>

        <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
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
