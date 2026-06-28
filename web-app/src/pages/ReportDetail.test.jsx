/**
 * Unit tests for ReportDetail page
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../services/realScannerData', () => ({
  loadRealScannerData: jest.fn(() => Promise.resolve({ recent_scans: [] })),
}));

jest.mock('../components/Charts', () => ({
  BarChart: jest.fn(() => null),
  DonutChart: jest.fn(() => null),
}));

jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    show: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}));

import ReportDetail from './ReportDetail';

describe('ReportDetail', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/report/1']}>
        <Routes>
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });
});
