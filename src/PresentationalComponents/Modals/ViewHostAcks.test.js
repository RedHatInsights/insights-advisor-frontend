import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewHostAcks from './ViewHostAcks';
import { useGetHostAcksQuery } from '../../Services/Acks';
import { DeleteApi } from '../../Utilities/Api';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';

jest.mock('../../Services/Acks', () => ({
  useGetHostAcksQuery: jest.fn(),
}));

jest.mock('../../Utilities/Api', () => ({
  DeleteApi: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('ViewHostAcks', () => {
  const mockRule = {
    rule_id: 'test-rule-123',
    hosts_acked_count: 2,
  };

  const mockHostAcks = [
    {
      id: 1,
      system_uuid: 'system-1',
      display_name: 'Test System 1',
      justification: 'Test justification 1',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      system_uuid: 'system-2',
      display_name: 'Test System 2',
      justification: 'Test justification 2',
      updated_at: '2025-01-02T00:00:00Z',
    },
  ];

  const defaultQueryResponse = {
    data: mockHostAcks,
    isFetching: false,
    isLoading: false,
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGetHostAcksQuery.mockReturnValue(defaultQueryResponse);
  });

  it('should render modal when isModalOpen is true', () => {
    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(
      screen.getByText(/Recommendation has been disabled for:/),
    ).toBeInTheDocument();
  });

  it('should display host acknowledgements in table', () => {
    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(screen.getByText('Test System 1')).toBeInTheDocument();
    expect(screen.getByText('Test System 2')).toBeInTheDocument();
    expect(screen.getByText('Test justification 1')).toBeInTheDocument();
    expect(screen.getByText('Test justification 2')).toBeInTheDocument();
  });

  it('should show loading state when isFetching is true', () => {
    useGetHostAcksQuery.mockReturnValue({
      ...defaultQueryResponse,
      isFetching: true,
    });

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    const table = screen.getByLabelText('host-ack-table');
    expect(table).toBeInTheDocument();
  });

  it('should skip query when modal is closed', () => {
    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: false,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(useGetHostAcksQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        rule_id: mockRule.rule_id,
        limit: mockRule.hosts_acked_count,
      }),
      expect.objectContaining({
        skip: true,
        refetchOnMountOrArgChange: true,
      }),
    );
  });

  it('should NOT skip query when modal is open', () => {
    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(useGetHostAcksQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        rule_id: mockRule.rule_id,
        limit: mockRule.hosts_acked_count,
      }),
      expect.objectContaining({
        skip: false,
        refetchOnMountOrArgChange: true,
      }),
    );
  });

  it('should NOT auto-close modal on initial load when data is being fetched', async () => {
    const handleModalToggle = jest.fn();
    const afterFn = jest.fn();

    useGetHostAcksQuery.mockReturnValue({
      data: [],
      isFetching: true,
      isLoading: true,
      refetch: jest.fn(),
    });

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle,
          isModalOpen: true,
          rule: mockRule,
          afterFn,
        }}
      />,
    );

    await waitFor(() => {
      expect(handleModalToggle).not.toHaveBeenCalled();
    });
    expect(afterFn).not.toHaveBeenCalled();
  });

  it('should NOT auto-close modal when initializing even with empty data', async () => {
    const handleModalToggle = jest.fn();
    const afterFn = jest.fn();

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle,
          isModalOpen: true,
          rule: mockRule,
          afterFn,
        }}
      />,
    );

    useGetHostAcksQuery.mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    await waitFor(
      () => {
        expect(handleModalToggle).not.toHaveBeenCalled();
      },
      { timeout: 100 },
    );
  });

  it('should call deleteAck when enable button is clicked', async () => {
    const mockRefetch = jest.fn();

    useGetHostAcksQuery.mockReturnValue({
      data: [mockHostAcks[0]],
      isFetching: false,
      isLoading: false,
      refetch: mockRefetch,
    });

    DeleteApi.mockResolvedValue({});

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    const user = userEvent.setup();

    const enableButton = screen.getByText(/Enable/);
    await user.click(enableButton);

    await waitFor(() => {
      expect(DeleteApi).toHaveBeenCalled();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should handle delete error gracefully', async () => {
    const handleModalToggle = jest.fn();
    const mockError = new Error('Delete failed');

    useGetHostAcksQuery.mockReturnValue({
      data: mockHostAcks,
      isFetching: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    DeleteApi.mockRejectedValue(mockError);

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle,
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    const user = userEvent.setup();

    const enableButton = screen.getAllByText(/Enable/)[0];
    await user.click(enableButton);

    await waitFor(() => {
      expect(DeleteApi).toHaveBeenCalled();
    });
    expect(handleModalToggle).toHaveBeenCalledWith(false);
  });

  it('should display "None" for missing justification', () => {
    const hostWithoutJustification = {
      id: 3,
      system_uuid: 'system-3',
      display_name: 'Test System 3',
      justification: null,
      updated_at: '2025-01-03T00:00:00Z',
    };

    useGetHostAcksQuery.mockReturnValue({
      data: [hostWithoutJustification],
      isFetching: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('should use system_uuid when display_name is not available', () => {
    const hostWithoutDisplayName = {
      id: 4,
      system_uuid: 'system-uuid-4',
      display_name: null,
      justification: 'Test',
      updated_at: '2025-01-04T00:00:00Z',
    };

    useGetHostAcksQuery.mockReturnValue({
      data: [hostWithoutDisplayName],
      isFetching: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(
      <ComponentWithContext
        Component={ViewHostAcks}
        componentProps={{
          handleModalToggle: jest.fn(),
          isModalOpen: true,
          rule: mockRule,
          afterFn: jest.fn(),
        }}
      />,
    );

    expect(screen.getByText('system-uuid-4')).toBeInTheDocument();
  });
});
