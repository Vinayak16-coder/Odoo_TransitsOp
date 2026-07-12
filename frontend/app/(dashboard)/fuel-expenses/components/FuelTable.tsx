'use client';

import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { RoleGate } from '@/components/shared/RoleGate';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export type FuelLog = {
  id: string;
  vehicle?: { regNo: string };
  trip?: { tripCode: string };
  date: string;
  liters: number;
  cost: number;
};

interface FuelTableProps {
  logs: FuelLog[];
  onDelete: (id: string) => void;
}

export function FuelTable({ logs, onDelete }: FuelTableProps) {
  const columns: ColumnDef<FuelLog>[] = [
    {
      accessorKey: 'vehicle',
      header: 'Vehicle',
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.vehicle?.regNo || 'Unknown'}</span>
    },
    {
      accessorKey: 'trip',
      header: 'Trip',
      cell: ({ row }) => <span className="text-zinc-400">{row.original.trip?.tripCode || 'N/A'}</span>
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
    },
    {
      accessorKey: 'liters',
      header: 'Liters',
      cell: ({ row }) => `${Number(row.original.liters).toFixed(1)} L`
    },
    {
      accessorKey: 'cost',
      header: 'Cost ($)',
      cell: ({ row }) => `$${Number(row.original.cost).toLocaleString()}`
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RoleGate allow={['FINANCIAL_ANALYST']}>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </RoleGate>
      )
    }
  ];

  return <DataTable columns={columns} data={logs} />;
}
