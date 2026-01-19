import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SystemDetail from '../SystemDetail';
import IopSystemAdvisor from '../../components/IopSystemAdvisor';

jest.mock('../../components/IopSystemAdvisor', () =>
  jest.fn(() => <div>Mocked IopSystemAdvisor</div>),
);

describe('SystemDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render IopSystemAdvisor', () => {
    render(<SystemDetail />);

    expect(IopSystemAdvisor).toHaveBeenCalled();
  });

  it('should pass response prop to IopSystemAdvisor', () => {
    const mockResponse = {
      insights_attributes: {
        uuid: 'test-uuid',
      },
    };

    render(<SystemDetail response={mockResponse} />);

    expect(IopSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: mockResponse,
      }),
      {},
    );
  });

  it('should pass IopRemediationModal prop to IopSystemAdvisor', () => {
    const CustomModal = () => <div>Custom Modal</div>;

    render(<SystemDetail IopRemediationModal={CustomModal} />);

    expect(IopSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        IopRemediationModal: CustomModal,
      }),
      {},
    );
  });

  it('should pass through all props to IopSystemAdvisor', () => {
    const mockProps = {
      response: { insights_attributes: { uuid: 'test' } },
      IopRemediationModal: () => <div>Modal</div>,
      customProp: 'customValue',
      anotherProp: 123,
    };

    render(<SystemDetail {...mockProps} />);

    expect(IopSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining(mockProps),
      {},
    );
  });

  it('should handle no props gracefully', () => {
    render(<SystemDetail />);

    expect(IopSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        IopRemediationModal: undefined,
      }),
      {},
    );
  });
});
