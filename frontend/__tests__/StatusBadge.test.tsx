import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { describe, it, expect } from 'vitest';

describe('StatusBadge', () => {
  it('renders status text correctly', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('replaces underscores with spaces', () => {
    render(<StatusBadge status="IN_TRANSIT" />);
    expect(screen.getByText('IN TRANSIT')).toBeInTheDocument();
  });

  it('applies a default color class for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    const badge = screen.getByText('UNKNOWN STATUS');
    expect(badge).toHaveClass('bg-zinc-500/10');
  });
});
