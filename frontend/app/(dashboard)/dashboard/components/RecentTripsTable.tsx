'use client';

import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export type Trip = {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  status: string;
  vehicle?: { regNo: string };
  driver?: { name: string };
};

const columns: ColumnDef<Trip>[] = [
  {
    accessorKey: 'tripCode',
    header: 'Trip Code',
    cell: ({ row }) => <span className="font-mono text-zinc-300">{row.original.tripCode}</span>
  },
  {
    accessorKey: 'route',
    header: 'Route',
    cell: ({ row }) => <span className="text-zinc-400">{row.original.source} → {row.original.destination}</span>
  },
  {
    accessorKey: 'vehicle',
    header: 'Vehicle',
    cell: ({ row }) => row.original.vehicle?.regNo || 'Unassigned'
  },
  {
    accessorKey: 'driver',
    header: 'Driver',
    cell: ({ row }) => row.original.driver?.name || 'Unassigned'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  }
];

export function RecentTripsTable({ trips }: { trips: Trip[] }) {
  return <DataTable columns={columns} data={trips} />;
}
