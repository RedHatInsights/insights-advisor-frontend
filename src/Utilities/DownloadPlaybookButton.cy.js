import React from 'react';
import DownloadPlaybookButton from './DownloadPlaybookButton';
import { REMEDIATIONS_BASE_URL } from '../AppConstants';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { initStore } from '../Store';

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
    <IntlProvider locale={navigator.language.slice(0, 2)}>
      <Provider store={initStore()}>
        <DownloadPlaybookButton
          isDisabled={isDisabled}
          rules={rules}
          systems={systems}
        />
      </Provider>
    </IntlProvider>,
  );
};

describe('DownloadPlaybookButton Component', () => {
  it('renders the button and triggers download when clicked', () => {
    mountComponent();

    cy.intercept('POST', `${REMEDIATIONS_BASE_URL}/playbook`, {
      statusCode: 200,
      body: 'mock-playbook-content',
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
