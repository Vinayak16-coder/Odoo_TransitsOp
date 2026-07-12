import { render, screen } from '@testing-library/react';
import { DataTable } from '../components/shared/DataTable';
import { describe, it, expect } from 'vitest';
import { ColumnDef } from '@tanstack/react-table';

type TestData = {
  id: string;
  name: string;
};

const columns: ColumnDef<TestData, any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

describe('DataTable', () => {
  it('renders correctly with data', () => {
    const data: TestData[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
    render(<DataTable columns={columns} data={data} />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<DataTable columns={columns} data={[]} />);
    
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });
});
