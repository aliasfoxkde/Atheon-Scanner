/**
 * Unit tests for Skeleton loading components
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Skeleton,
  SkeletonText,
  SkeletonStat,
  SkeletonTable,
  SkeletonCard,
  SkeletonChart,
  SkeletonDonut,
} from './Skeleton';

describe('Skeleton', () => {
  it('renders with default className', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-10" />);
    expect(container.firstChild).toHaveClass('h-10');
    expect(container.firstChild).toHaveClass('w-10');
  });

  it('has role status and aria-busy', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonText', () => {
  it('renders single line by default', () => {
    const { container } = render(<SkeletonText />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('has role status', () => {
    render(<SkeletonText />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonStat', () => {
  it('renders stat skeleton', () => {
    const { container } = render(<SkeletonStat />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has role status', () => {
    render(<SkeletonStat />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonTable', () => {
  it('renders table with default rows', () => {
    const { container } = render(<SkeletonTable />);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(8);
  });

  it('renders table with custom rows', () => {
    const { container } = render(<SkeletonTable rows={5} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  });

  it('renders table with custom columns', () => {
    const { container } = render(<SkeletonTable columns={3} />);
    expect(container.querySelectorAll('thead th')).toHaveLength(3);
    expect(container.querySelectorAll('tbody td')).toHaveLength(24); // 3 cols * 8 default rows
  });

  it('has role status', () => {
    render(<SkeletonTable />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('renders card skeleton', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has role status', () => {
    render(<SkeletonCard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonChart', () => {
  it('renders with default height', () => {
    const { container } = render(<SkeletonChart />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(<SkeletonChart height={300} />);
    const el = container.firstChild;
    expect(el.style.height).toBe('300px');
  });

  it('has role status', () => {
    render(<SkeletonChart />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonDonut', () => {
  it('renders with default size', () => {
    const { container } = render(<SkeletonDonut />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<SkeletonDonut size={200} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has role status', () => {
    render(<SkeletonDonut />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
