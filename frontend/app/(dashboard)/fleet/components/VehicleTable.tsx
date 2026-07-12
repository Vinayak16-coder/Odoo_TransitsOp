'use client';

import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { RoleGate } from '@/components/shared/RoleGate';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, RefreshCw, Trash2 } from 'lucide-react';

export type Vehicle = {
  id: string;
  regNo: string;
  nameModel: string;
  type: string;
  capacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  avgCostPerKm: number;
  status: string;
};

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (v: Vehicle) => void;
  onChangeStatus: (v: Vehicle) => void;
  onRetire: (v: Vehicle) => void;
}

export function VehicleTable({ vehicles, onEdit, onChangeStatus, onRetire }: VehicleTableProps) {
  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: 'regNo',
      header: 'Reg No.',
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.regNo}</span>
    },
    {
      accessorKey: 'nameModel',
      header: 'Name/Model',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'capacityKg',
      header: 'Capacity (kg)',
    },
    {
      accessorKey: 'odometerKm',
      header: 'Odometer (km)',
    },
    {
      accessorKey: 'acquisitionCost',
      header: 'Acq. Cost ($)',
      cell: ({ row }) => `$${Number(row.original.acquisitionCost).toLocaleString()}`
    },
    {
      accessorKey: 'avgCostPerKm',
      header: 'Avg Cost/km',
      cell: ({ row }) => `$${Number(row.original.avgCostPerKm).toFixed(2)}`
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
          <RoleGate allow={['FLEET_MANAGER']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
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
                {row.original.status !== 'RETIRED' && (
                  <DropdownMenuItem onClick={() => onRetire(row.original)} className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Retire Vehicle
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGate>
        );
      }
    }
  ];

  return <DataTable columns={columns} data={vehicles} />;
}
