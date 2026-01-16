import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import IopSystemAdvisor from '../IopSystemAdvisor';
import { BaseSystemAdvisor } from '../../../SmartComponents/SystemAdvisor/SystemAdvisor';

jest.mock('../../../SmartComponents/SystemAdvisor/SystemAdvisor', () => ({
  BaseSystemAdvisor: jest.fn(() => <div>Mocked BaseSystemAdvisor</div>),
}));

describe('IopSystemAdvisor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render BaseSystemAdvisor', () => {
    const mockResponse = {
      insights_attributes: {
        uuid: 'test-uuid-123',
      },
    };

    render(<IopSystemAdvisor response={mockResponse} />);

    expect(BaseSystemAdvisor).toHaveBeenCalled();
  });

  it('should extract inventoryId from response and pass to BaseSystemAdvisor', () => {
    const mockResponse = {
      insights_attributes: {
        uuid: 'test-uuid-456',
      },
    };

    render(<IopSystemAdvisor response={mockResponse} />);

    expect(BaseSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: mockResponse,
        inventoryId: 'test-uuid-456',
        entity: {
          id: 'test-uuid-456',
          insights_id: 'test-uuid-456',
        },
      }),
      {},
    );
  });

  it('should handle missing insights_attributes', () => {
    const mockResponse = {};

    render(<IopSystemAdvisor response={mockResponse} />);

    expect(BaseSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: mockResponse,
        inventoryId: undefined,
        entity: {
          id: undefined,
          insights_id: undefined,
        },
      }),
      {},
    );
  });

  it('should handle missing uuid', () => {
    const mockResponse = {
      insights_attributes: {},
    };

    render(<IopSystemAdvisor response={mockResponse} />);

    expect(BaseSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: mockResponse,
        inventoryId: undefined,
        entity: {
          id: undefined,
          insights_id: undefined,
        },
      }),
      {},
    );
  });

  it('should pass through additional props to BaseSystemAdvisor', () => {
    const mockResponse = {
      insights_attributes: {
        uuid: 'test-uuid-789',
      },
    };

    const CustomModal = () => <div>Custom Modal</div>;

    render(
      <IopSystemAdvisor
        response={mockResponse}
        IopRemediationModal={CustomModal}
        customProp="customValue"
      />,
    );

    expect(BaseSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: mockResponse,
        IopRemediationModal: CustomModal,
        customProp: 'customValue',
        inventoryId: 'test-uuid-789',
        entity: {
          id: 'test-uuid-789',
          insights_id: 'test-uuid-789',
        },
      }),
      {},
    );
  });

  it('should handle null response', () => {
    render(<IopSystemAdvisor response={null} />);

    expect(BaseSystemAdvisor).toHaveBeenCalledWith(
      expect.objectContaining({
        response: null,
        inventoryId: undefined,
        entity: {
          id: undefined,
          insights_id: undefined,
        },
      }),
      {},
    );
  });
});
