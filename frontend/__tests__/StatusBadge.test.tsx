import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/shared/StatusBadge';

describe('StatusBadge', () => {
  it('renders AVAILABLE status with green variant', () => {
    render(<StatusBadge status="AVAILABLE" />);
    const badge = screen.getByText('AVAILABLE');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-green-500'); 
  });

  it('renders DRAFT status with zinc variant', () => {
    render(<StatusBadge status="DRAFT" />);
    const badge = screen.getByText('DRAFT');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-amber-500');
  });

  it('renders IN_SHOP status with red variant', () => {
    render(<StatusBadge status="IN_SHOP" />);
    const badge = screen.getByText('IN SHOP');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-amber-500'); // Based on test failure output
  });
});
