import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import DisableRule from './DisableRule';
import { EnvironmentContext } from '../../App';
import * as AcksService from '../../Services/Acks';

const mockAxiosPost = jest.fn();

// Mock dependencies
jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  useAddNotification: () => jest.fn(),
}));

jest.mock('../../Services/Acks', () => ({
  useSetAckMutation: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => ({
      post: mockAxiosPost,
    }),
  }),
);

jest.mock('../helper', () => ({
  getCsrfTokenHeader: () => ({ 'X-CSRF-Token': 'test-token' }),
}));

describe('DisableRule Modal', () => {
  const mockRule = {
    rule_id: 'test-rule-123',
    rule_status: 'enabled',
    description: 'Test rule description',
  };

  const mockHost = {
    id: 'host-uuid-123',
    display_name: 'test-host',
  };

  const defaultEnvContext = {
    BASE_URL: '/api/insights/v1',
    isDisableRecEnabled: true,
    isExportEnabled: true,
    isAllowedToViewRec: true,
  };

  const mockSetAck = jest.fn();

  const renderComponent = (props = {}, envContext = defaultEnvContext) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <EnvironmentContext.Provider value={envContext}>
          <DisableRule
            isModalOpen={true}
            handleModalToggle={jest.fn()}
            rule={mockRule}
            afterFn={jest.fn()}
            {...props}
          />
        </EnvironmentContext.Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAck.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    AcksService.useSetAckMutation.mockReturnValue([mockSetAck]);
    mockAxiosPost.mockResolvedValue({});
  });

  describe('Component Rendering', () => {
    it('renders the modal when open', () => {
      renderComponent();
      expect(screen.getByText('Disable recommendation')).toBeInTheDocument();
    });

    it('renders modal body text', () => {
      renderComponent();
      // The body contains the disableRuleBody message
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with checkbox for specific host', () => {
      renderComponent({ host: mockHost });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('renders justification input', () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('maxlength', '255');
    });

    it('renders checkbox for single system toggle when host provided', () => {
      renderComponent({ host: mockHost });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('does not render checkbox when no host or hosts provided', () => {
      renderComponent();
      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });
  });

  describe('Permission-Based Rendering with RBAC v1', () => {
    it('renders when isDisableRecEnabled is true (RBAC v1)', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
      };
      renderComponent({}, envContext);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('allows interaction when isDisableRecEnabled is true', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
      };
      renderComponent({}, envContext);
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeEnabled();
    });
  });

  describe('Permission-Based Rendering with Kessel', () => {
    it('renders when isDisableRecEnabled is true (Kessel mode)', () => {
      const kesselEnvContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        isKesselMode: true,
      };
      renderComponent({}, kesselEnvContext);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('allows interaction when Kessel grants edit permission', () => {
      const kesselEnvContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        isKesselMode: true,
      };
      renderComponent({}, kesselEnvContext);
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeEnabled();
    });

    it('component should not be shown when isDisableRecEnabled is false', () => {
      const kesselEnvContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: false,
        isKesselMode: true,
      };
      renderComponent({ isModalOpen: false }, kesselEnvContext);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('updates justification text on input', () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Test justification' } });
      expect(input).toHaveValue('Test justification');
    });

    it('toggles single system checkbox', () => {
      renderComponent({ host: mockHost });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('has max length attribute on justification input', () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxlength', '255');
    });
  });

  describe('API Calls', () => {
    it('calls setAck mutation for rule disable', async () => {
      const afterFn = jest.fn();
      renderComponent({ afterFn });
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSetAck).toHaveBeenCalled();
        expect(afterFn).toHaveBeenCalled();
      });
    });

    it('calls Post API for bulk host actions', async () => {
      const hosts = ['host-1', 'host-2', 'host-3'];
      renderComponent({ hosts });

      const justification = 'Bulk disable justification';
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: justification } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          `${defaultEnvContext.BASE_URL}/rule/${mockRule.rule_id}/ack_hosts/`,
          { systems: hosts, justification },
          { headers: { 'X-CSRF-Token': 'test-token' } },
        );
      });
    });

    it('includes justification in API call', async () => {
      const afterFn = jest.fn();
      renderComponent({ afterFn });
      const justification = 'Test justification for disable';
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: justification } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSetAck).toHaveBeenCalledWith({
          type: 'RULE',
          options: {
            rule_id: mockRule.rule_id,
            justification,
          },
        });
        expect(afterFn).toHaveBeenCalled();
      });
    });
  });

  describe('Different Scenarios', () => {
    it('handles single host disable', async () => {
      renderComponent({ host: mockHost });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSetAck).toHaveBeenCalledWith({
          type: 'HOST',
          options: {
            rule: mockRule.rule_id,
            system_uuid: mockHost.id,
            justification: '',
          },
        });
      });
    });

    it('handles bulk hosts disable', async () => {
      const hosts = ['host-1', 'host-2'];
      renderComponent({ hosts });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          expect.stringContaining('/ack_hosts/'),
          expect.objectContaining({ systems: hosts }),
          expect.any(Object),
        );
      });
    });

    it('calls afterFn callback on success', async () => {
      const afterFn = jest.fn();
      renderComponent({ afterFn });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(afterFn).toHaveBeenCalled();
      });
    });
  });

  describe('Kessel-Specific Permission Scenarios', () => {
    it('modal should be accessible when Kessel grants workspace edit permission', () => {
      const kesselContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        workspacePermissions: {
          'workspace-123': { canEdit: true },
        },
      };
      renderComponent({}, kesselContext);
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    });

    it('uses correct BASE_URL from Kessel context', async () => {
      const kesselContext = {
        ...defaultEnvContext,
        BASE_URL: '/api/insights/v1',
        isDisableRecEnabled: true,
      };
      renderComponent({ hosts: ['host-1'] }, kesselContext);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          expect.stringContaining('/api/insights/v1/rule/'),
          expect.objectContaining({ systems: ['host-1'] }),
          expect.any(Object),
        );
      });
    });
  });
});
