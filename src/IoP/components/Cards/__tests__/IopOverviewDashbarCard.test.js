import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { IopOverviewDashbarCard } from '../IopOverviewDashbarCard';

describe('IopOverviewDashbarCard', () => {
  const user = userEvent.setup();

  test('should render card with all props', () => {
    const mockOnClick = jest.fn();
    render(
      <IopOverviewDashbarCard
        isLoaded
        name="test-metric"
        title="Test Metric"
        badge={<span>Test Badge</span>}
        count={42}
        onClickFilterByName={mockOnClick}
      />,
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('should show skeleton when not loaded', () => {
    const mockOnClick = jest.fn();
    render(
      <IopOverviewDashbarCard
        isLoaded={false}
        name="test-metric"
        title="Test Metric"
        badge={<span>Test Badge</span>}
        count={42}
        onClickFilterByName={mockOnClick}
      />,
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  test('should call onClickFilterByName when count is clicked', async () => {
    const mockOnClick = jest.fn();
    render(
      <IopOverviewDashbarCard
        isLoaded
        name="test-metric"
        title="Test Metric"
        badge={<span>Test Badge</span>}
        count={42}
        onClickFilterByName={mockOnClick}
      />,
    );

    const filterButton = screen.getByTestId('test-metric');
    await user.click(filterButton);
    expect(mockOnClick).toHaveBeenCalledWith('test-metric');
  });

  test('should render with custom badge component', () => {
    const mockOnClick = jest.fn();
    const CustomBadge = () => <div data-testid="custom-badge">Custom</div>;

    render(
      <IopOverviewDashbarCard
        isLoaded
        name="test-metric"
        title="Test Metric"
        badge={<CustomBadge />}
        count={100}
        onClickFilterByName={mockOnClick}
      />,
    );

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  test('should render count as zero', () => {
    const mockOnClick = jest.fn();
    render(
      <IopOverviewDashbarCard
        isLoaded
        name="test-metric"
        title="Test Metric"
        badge={<span>Badge</span>}
        count={0}
        onClickFilterByName={mockOnClick}
      />,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
