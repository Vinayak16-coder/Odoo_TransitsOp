'use client';

import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { RoleGate } from '@/components/shared/RoleGate';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, RefreshCw, Ban } from 'lucide-react';
import { isBefore, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export type Driver = {
  id: string;
  name: string;
  licenseNo: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  status: string;
  // Placeholder metrics for future implementation
  tripCompletionPct?: number;
  safetyScorePct?: number;
};

interface DriverTableProps {
  drivers: Driver[];
  onEdit: (d: Driver) => void;
  onChangeStatus: (d: Driver) => void;
  onSuspend: (d: Driver) => void;
}

export function DriverTable({ drivers, onEdit, onChangeStatus, onSuspend }: DriverTableProps) {
  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: 'name',
      header: 'Driver Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'licenseNo',
      header: 'License No.',
    },
    {
      accessorKey: 'licenseCategory',
      header: 'Category',
    },
    {
      accessorKey: 'licenseExpiry',
      header: 'Expiry',
      cell: ({ row }) => {
        const expiryDate = new Date(row.original.licenseExpiry);
        const isExpired = isBefore(expiryDate, startOfDay(new Date()));
        const dateString = expiryDate.toLocaleDateString();
        
        if (isExpired) {
          return <span className="text-red-500 font-semibold">{dateString} (Expired)</span>;
        }
        return <span>{dateString}</span>;
      }
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'tripCompletionPct',
      header: 'Trip Completion',
      cell: () => <span className="text-zinc-400">98%</span> // Placeholder as per brief
    },
    {
      accessorKey: 'safetyScorePct',
      header: 'Safety Score',
      cell: () => <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">95%</Badge> // Placeholder
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <RoleGate allow={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 outline-none transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer focus:bg-zinc-900">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus(row.original)} className="cursor-pointer focus:bg-zinc-900">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Change Status
                </DropdownMenuItem>
                {row.original.status !== 'SUSPENDED' && (
                  <DropdownMenuItem onClick={() => onSuspend(row.original)} className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend Driver
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGate>
        );
      }
    }
  ];

  return <DataTable columns={columns} data={drivers} />;
}
