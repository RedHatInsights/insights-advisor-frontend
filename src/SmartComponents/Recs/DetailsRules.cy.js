import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';

import rulesfixtures from '../../../cypress/fixtures/detailsrules.json';
import topicsfixtures from '../../../cypress/fixtures/detailsrulestopic.json';

const disableRec = true;
const dropdownOpen = false;
import { DetailsRules } from './DetailsRules';
const ruleDescription = rulesfixtures.description;
const ROOT =
  'div[class="pf-l-flex pf-m-column pf-m-row-on-lg pf-m-nowrap ins-c-rule-details"]';

const mountComponent = () => {
  const store = getStore();
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0, 2)}>
        <Provider store={store}>
          <DetailsRules
            rule={rulesfixtures}
            topics={topicsfixtures}
            permsDisableRec={disableRec}
            setActionsDropdownOpen={null}
            actionsDropdownOpen={dropdownOpen}
            addNotification={null}
            handleModalToggle={null}
            refetch={null}
          />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('defaults', () => {
  beforeEach(() => {
    mountComponent();
  });
  it('The Rules description renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });
  it('header shows description', () => {
    cy.ouiaType('PF4/Title', 'h1')
      .should(($el) => expect($el.text().trim()).to.equal(ruleDescription))
      .and('have.length', 1);
  });
});
