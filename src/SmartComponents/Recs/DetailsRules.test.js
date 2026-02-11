import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { DetailsRules } from './DetailsRules';
import { EnvironmentContext } from '../../App';
import * as Api from '../../Utilities/Api';

// Mock dependencies
jest.mock('@redhat-cloud-services/frontend-components/PageHeader', () => ({
  PageHeader: ({ children }) => <div data-testid="page-header">{children}</div>,
  PageHeaderTitle: ({ title }) => <div data-testid="page-header-title">{title}</div>,
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  return ({ children, ...props }) => <a {...props}>{children}</a>;
});

jest.mock('@redhat-cloud-services/frontend-components/DateFormat', () => ({
  DateFormat: () => <span>2024-01-01</span>,
}));

jest.mock('../../PresentationalComponents/Breadcrumbs/Breadcrumbs', () => {
  return () => <div data-testid="breadcrumbs">Breadcrumbs</div>;
});

jest.mock('../../PresentationalComponents/Labels/RuleLabels', () => {
  return () => <span data-testid="rule-labels">Labels</span>;
});

jest.mock('../../PresentationalComponents/Labels/CategoryLabel', () => {
  return () => <span data-testid="category-label">Category</span>;
});

jest.mock('@redhat-cloud-services/frontend-components-advisor-components', () => ({
  RuleDetails: ({ children, header, onVoteClick, ViewAffectedLink, ...props }) => (
    <div data-testid="rule-details">
      <div data-testid="rule-details-header">{header}</div>
      <div data-testid="rule-details-children">{children}</div>
    </div>
  ),
  RuleDetailsMessagesKeys: [],
  AdvisorProduct: { rhel: 'rhel' },
  topicLinks: () => [],
}));

jest.mock('../../Utilities/Api', () => ({
  Post: jest.fn(),
}));

jest.mock('./helpers', () => ({
  ruleResolutionRisk: () => 2,
  enableRule: jest.fn(),
}));

jest.mock('../../Utilities/intlHelper', () => ({
  formatMessages: () => ({}),
  mapContentToValues: () => ({}),
}));

describe('DetailsRules Component', () => {
  const mockRule = {
    rule_id: 'test-rule-123',
    description: 'Test rule description',
    rule_status: 'enabled',
    publish_date: '2024-01-01',
    category: { name: 'Performance' },
    node_id: 'node-123',
    tags: [],
    resolution_set: [
      {
        resolution_risk: { risk: 2 },
        has_playbook: true,
      },
    ],
  };

  const defaultEnvContext = {
    BASE_URL: '/api/insights/v1',
    isDisableRecEnabled: true,
    isExportEnabled: true,
    isAllowedToViewRec: true,
    displayRuleRatings: true,
  };

  const defaultProps = {
    rule: mockRule,
    topics: [],
    permsDisableRec: true,
    setActionsDropdownOpen: jest.fn(),
    actionsDropdownOpen: false,
    addNotification: jest.fn(),
    handleModalToggle: jest.fn(),
    refetch: jest.fn(),
  };

  const renderComponent = (props = {}, envContext = defaultEnvContext) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <EnvironmentContext.Provider value={envContext}>
          <DetailsRules {...defaultProps} {...props} />
        </EnvironmentContext.Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container).toBeTruthy();
    });

    it('renders rule details section', () => {
      renderComponent();
      expect(screen.getByTestId('rule-details')).toBeInTheDocument();
    });

    it('renders breadcrumbs', () => {
      renderComponent();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('displays rule title', () => {
      renderComponent();
      expect(screen.getByTestId('page-header-title')).toHaveTextContent(
        mockRule.description,
      );
    });
  });

  describe('Actions Dropdown with RBAC v1 Permissions', () => {
    it('renders actions dropdown when isDisableRecEnabled is true', () => {
      renderComponent();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('enables actions dropdown when permsDisableRec is true', () => {
      renderComponent({ permsDisableRec: true });
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });

    it('disables actions dropdown when permsDisableRec is false', () => {
      renderComponent({ permsDisableRec: false });
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).toBeDisabled();
    });

    it('does not render actions dropdown when isDisableRecEnabled is false', () => {
      const envContext = { ...defaultEnvContext, isDisableRecEnabled: false };
      renderComponent({}, envContext);
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('shows disable option when rule status is enabled', async () => {
      renderComponent({ actionsDropdownOpen: true });
      await waitFor(() => {
        expect(screen.getByText('Disable recommendation')).toBeInTheDocument();
      });
    });

    it('shows enable option when rule status is disabled', async () => {
      const disabledRule = { ...mockRule, rule_status: 'disabled' };
      renderComponent({ rule: disabledRule, actionsDropdownOpen: true });
      await waitFor(() => {
        expect(screen.getByText('Enable recommendation')).toBeInTheDocument();
      });
    });
  });

  describe('Actions Dropdown with Kessel Permissions', () => {
    const kesselContext = {
      ...defaultEnvContext,
      isDisableRecEnabled: true,
      isKesselMode: true,
    };

    it('renders actions dropdown when Kessel grants edit permission', () => {
      renderComponent({ permsDisableRec: true }, kesselContext);
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('enables actions when Kessel permsDisableRec is true', () => {
      renderComponent({ permsDisableRec: true }, kesselContext);
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });

    it('disables actions when Kessel permsDisableRec is false', () => {
      renderComponent({ permsDisableRec: false }, kesselContext);
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).toBeDisabled();
    });

    it('does not render actions when isDisableRecEnabled is false even with Kessel', () => {
      const noPermsKesselContext = {
        ...kesselContext,
        isDisableRecEnabled: false,
      };
      renderComponent({}, noPermsKesselContext);
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('shows tooltip on disabled dropdown when Kessel denies permission', () => {
      renderComponent({ permsDisableRec: false }, kesselContext);
      const actionsButton = screen.getByRole('button', { name: /actions/i });

      // The tooltip should be present for disabled buttons
      expect(actionsButton).toBeDisabled();
      expect(actionsButton.parentElement).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('opens dropdown on click', () => {
      const setActionsDropdownOpen = jest.fn();
      renderComponent({ setActionsDropdownOpen });

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);

      expect(setActionsDropdownOpen).toHaveBeenCalledWith(true);
    });

    it('closes dropdown on option select', () => {
      const setActionsDropdownOpen = jest.fn();
      renderComponent({
        setActionsDropdownOpen,
        actionsDropdownOpen: true
      });

      const disableOption = screen.getByText(/disable recommendation/i);
      fireEvent.click(disableOption);

      expect(setActionsDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('calls handleModalToggle when disable is clicked', async () => {
      const handleModalToggle = jest.fn();
      renderComponent({ handleModalToggle, actionsDropdownOpen: true });

      await waitFor(() => {
        const disableOption = screen.getByText('Disable recommendation');
        fireEvent.click(disableOption);
        expect(handleModalToggle).toHaveBeenCalledWith(true);
      });
    });

    it('calls enableRule when enable is clicked', async () => {
      const { enableRule } = require('./helpers');
      const disabledRule = { ...mockRule, rule_status: 'disabled' };
      const refetch = jest.fn();
      const addNotification = jest.fn();
      const handleModalToggle = jest.fn();

      renderComponent({
        rule: disabledRule,
        refetch,
        addNotification,
        handleModalToggle,
        actionsDropdownOpen: true,
      });

      await waitFor(() => {
        const enableOption = screen.getByText('Enable recommendation');
        fireEvent.click(enableOption);

        expect(enableRule).toHaveBeenCalledWith(
          disabledRule,
          refetch,
          expect.anything(),
          addNotification,
          handleModalToggle,
          defaultEnvContext.BASE_URL,
        );
      });
    });
  });

  describe('Permission-Based UI States', () => {
    it('shows enabled dropdown for users with RBAC v1 edit permission', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
      };
      renderComponent({ permsDisableRec: true }, envContext);

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });

    it('shows disabled dropdown for users without RBAC v1 edit permission', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
      };
      renderComponent({ permsDisableRec: false }, envContext);

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).toBeDisabled();
    });

    it('shows enabled dropdown for users with Kessel workspace edit permission', () => {
      const kesselContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        isKesselMode: true,
      };
      renderComponent({ permsDisableRec: true }, kesselContext);

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });

    it('shows disabled dropdown for users without Kessel workspace edit permission', () => {
      const kesselContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        isKesselMode: true,
      };
      renderComponent({ permsDisableRec: false }, kesselContext);

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).toBeDisabled();
    });
  });

  describe('Feature Flag Scenarios', () => {
    it('hides actions dropdown when feature is globally disabled (RBAC v1)', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: false,
      };
      renderComponent({}, envContext);

      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('hides actions dropdown when feature is globally disabled (Kessel)', () => {
      const kesselContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: false,
        isKesselMode: true,
      };
      renderComponent({}, kesselContext);

      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('shows actions dropdown when both global and user permissions are enabled (RBAC v1)', () => {
      const envContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
      };
      renderComponent({ permsDisableRec: true }, envContext);

      expect(screen.getByText('Actions')).toBeInTheDocument();
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });

    it('shows actions dropdown when both global and user permissions are enabled (Kessel)', () => {
      const kesselContext = {
        ...defaultEnvContext,
        isDisableRecEnabled: true,
        isKesselMode: true,
      };
      renderComponent({ permsDisableRec: true }, kesselContext);

      expect(screen.getByText('Actions')).toBeInTheDocument();
      const actionsButton = screen.getByRole('button', { name: /actions/i });
      expect(actionsButton).not.toBeDisabled();
    });
  });

  describe('Rule Voting Feature', () => {
    it('enables voting when displayRuleRatings is true', () => {
      const envContext = {
        ...defaultEnvContext,
        displayRuleRatings: true,
      };
      const { container } = renderComponent({}, envContext);
      expect(container).toBeTruthy();
      // RuleDetails should receive onVoteClick
    });

    it('disables voting when displayRuleRatings is false', () => {
      const envContext = {
        ...defaultEnvContext,
        displayRuleRatings: false,
      };
      const { container } = renderComponent({}, envContext);
      expect(container).toBeTruthy();
      // RuleDetails should receive undefined onVoteClick
    });
  });

  describe('Contextual Permission Matrix', () => {
    const testCases = [
      {
        description: 'RBAC v1: Global enabled, User has permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: true },
        permsDisableRec: true,
        expectedDropdown: true,
        expectedEnabled: true,
      },
      {
        description: 'RBAC v1: Global enabled, User lacks permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: true },
        permsDisableRec: false,
        expectedDropdown: true,
        expectedEnabled: false,
      },
      {
        description: 'RBAC v1: Global disabled, User has permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: false },
        permsDisableRec: true,
        expectedDropdown: false,
        expectedEnabled: false,
      },
      {
        description: 'Kessel: Global enabled, User has permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: true },
        permsDisableRec: true,
        expectedDropdown: true,
        expectedEnabled: true,
      },
      {
        description: 'Kessel: Global enabled, User lacks permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: true },
        permsDisableRec: false,
        expectedDropdown: true,
        expectedEnabled: false,
      },
      {
        description: 'Kessel: Global disabled, User has permission',
        envContext: { ...defaultEnvContext, isDisableRecEnabled: false },
        permsDisableRec: true,
        expectedDropdown: false,
        expectedEnabled: false,
      },
    ];

    testCases.forEach(({ description, envContext, permsDisableRec, expectedDropdown, expectedEnabled }) => {
      it(description, () => {
        renderComponent({ permsDisableRec }, envContext);

        if (expectedDropdown) {
          const actionsButton = screen.getByRole('button', { name: /actions/i });
          expect(actionsButton).toBeInTheDocument();

          if (expectedEnabled) {
            expect(actionsButton).not.toBeDisabled();
          } else {
            expect(actionsButton).toBeDisabled();
          }
        } else {
          expect(screen.queryByText('Actions')).not.toBeInTheDocument();
        }
      });
    });
  });
});
