'use client';

import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { RoleGate } from '@/components/shared/RoleGate';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export type ExpenseLog = {
  id: string;
  vehicle?: { regNo: string };
  trip?: { tripCode: string };
  category: string;
  toll: number;
  other: number;
  total: number;
};

interface ExpenseTableProps {
  logs: ExpenseLog[];
  onDelete: (id: string) => void;
}

export function ExpenseTable({ logs, onDelete }: ExpenseTableProps) {
  const columns: ColumnDef<ExpenseLog>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="font-semibold text-zinc-300">{row.original.category}</span>
    },
    {
      accessorKey: 'vehicle',
      header: 'Vehicle',
      cell: ({ row }) => <span className="font-mono text-zinc-400">{row.original.vehicle?.regNo || 'N/A'}</span>
    },
    {
      accessorKey: 'trip',
      header: 'Trip',
      cell: ({ row }) => <span className="text-zinc-400">{row.original.trip?.tripCode || 'N/A'}</span>
    },
    {
      accessorKey: 'toll',
      header: 'Toll ($)',
      cell: ({ row }) => `$${Number(row.original.toll).toLocaleString()}`
    },
    {
      accessorKey: 'other',
      header: 'Other ($)',
      cell: ({ row }) => `$${Number(row.original.other).toLocaleString()}`
    },
    {
      accessorKey: 'total',
      header: 'Total ($)',
      cell: ({ row }) => <span className="font-mono text-amber-500 font-semibold">${Number(row.original.total).toLocaleString()}</span>
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
