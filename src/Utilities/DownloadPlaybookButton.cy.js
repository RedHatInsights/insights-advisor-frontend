import React from 'react';
import DownloadPlaybookButton from './DownloadPlaybookButton';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { initStore } from '../Store';
import { IOP_ENVIRONMENT_CONTEXT } from '../AppConstants';
import { EnvironmentContext } from '../App';

const mockRules = [
  {
    rule_id: 'rule1',
    resolution_set: [{ has_playbook: true }],
    reboot_required: false,
  },
];
const mockSystems = ['system1'];

const mountComponent = (
  isDisabled = false,
  rules = mockRules,
  systems = mockSystems,
) => {
  cy.mount(
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <IntlProvider locale={navigator.language.slice(0, 2)}>
        <Provider store={initStore()}>
          <DownloadPlaybookButton
            isDisabled={isDisabled}
            rules={rules}
            systems={systems}
          />
        </Provider>
      </IntlProvider>
    </EnvironmentContext.Provider>,
  );
};

describe('DownloadPlaybookButton Component', () => {
  it('renders the button and triggers download when clicked', () => {
    mountComponent();

    const playbookURL = `${IOP_ENVIRONMENT_CONTEXT.REMEDIATIONS_BASE_URL}/playbook`;
    cy.log('Intercepting playbook URL:', playbookURL);
    cy.intercept('POST', playbookURL, (req) => {
      req.headers['X-CSRF-Token'] = 'x-csrf-token';
      req.reply({
        statusCode: 200,
        body: 'mock-playbook-content',
      });
    }).as('postPlaybook');

    cy.get('button').contains('Download playbook').click();
    cy.wait('@postPlaybook')
      .its('request.body')
      .should('deep.equal', {
        auto_reboot: false,
        issues: [{ id: 'advisor:rule1', systems: ['system1'] }],
      });
  });

  it('disables the button when isDisabled is true', () => {
    mountComponent({ isDisabled: true, rules: [{}], systems: [] });
    cy.get('button').should('be.disabled');
  });
});
