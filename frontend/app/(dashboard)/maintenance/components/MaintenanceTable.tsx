'use client';

import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { RoleGate } from '@/components/shared/RoleGate';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../../fleet/components/VehicleTable';

export type MaintenanceLog = {
  id: string;
  serviceType: string;
  cost: number;
  serviceDate: string;
  notes?: string;
  status: string;
  vehicle?: Vehicle;
};

interface MaintenanceTableProps {
  logs: MaintenanceLog[];
  onMarkComplete: (log: MaintenanceLog) => void;
}

export function MaintenanceTable({ logs, onMarkComplete }: MaintenanceTableProps) {
  const columns: ColumnDef<MaintenanceLog>[] = [
    {
      accessorKey: 'vehicle',
      header: 'Vehicle',
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.vehicle?.regNo || 'Unassigned'}</span>
    },
    {
      accessorKey: 'serviceType',
      header: 'Service Type',
    },
    {
      accessorKey: 'serviceDate',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.serviceDate).toLocaleDateString()
    },
    {
      accessorKey: 'cost',
      header: 'Cost ($)',
      cell: ({ row }) => `$${Number(row.original.cost).toLocaleString()}`
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.status === 'COMPLETED') return null;
        
        return (
          <RoleGate allow={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-500 hover:text-green-400 border-zinc-700 hover:bg-green-500/10"
              onClick={() => onMarkComplete(row.original)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
            </Button>
          </RoleGate>
        );
      }
    }
  ];

  return <DataTable columns={columns} data={logs} />;
}
