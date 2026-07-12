import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../components/shared/DataTable';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<any>();
const columns = [
  columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue() })
];
const data = [{ name: 'Test Row 1' }];

describe('DataTable', () => {
  it('renders columns and data correctly', () => {
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    expect(screen.getByText('Test Row 1')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<DataTable columns={columns} data={[]} searchKey="name" />);
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });
});
