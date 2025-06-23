import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';

import rulesfixtures from '../../../cypress/fixtures/detailsrules.json';
import topicsfixtures from '../../../cypress/fixtures/detailsrulestopic.json';

const disableRec = true;
const dropdownOpen = false;
import { DetailsRules } from './DetailsRules';
const ruleDescription = rulesfixtures.description;
const ROOT =
  'div[class="pf-v5-l-flex pf-m-column pf-m-row-on-lg pf-m-nowrap ins-c-rule-details"]';
import { EnvironmentContext } from '../../App';

const mountComponent = (envContext = {}) => {
  cy.mount(
    <EnvironmentContext.Provider value={envContext}>
      <MemoryRouter>
        <IntlProvider locale={navigator.language.slice(0, 2)}>
          <Provider store={initStore()}>
            <Routes>
              <Route
                key={'Recommendation details'}
                path="*"
                element={
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
                }
              />
            </Routes>
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    </EnvironmentContext.Provider>,
  );
};

describe('test mock data', () => {
  it('has total risk set to 4 (critical)', () => {
    expect(rulesfixtures.total_risk).to.eq(4);
  });
  it('reboot is required', () => {
    expect(rulesfixtures.reboot_required).to.eq(true);
  });
});

describe('defaults', () => {
  beforeEach(() => {
    mountComponent({ displayRuleRatings: true });
  });
  it('The Rules description component renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });
  it('title and description are correct', () => {
    cy.ouiaId('rule-title-text')
      .should(($el) => expect($el.text().trim()).to.equal(ruleDescription))
      .and('have.length', 1);
    cy.get('.ins-c-rule-details__description').should(
      'have.text',
      rulesfixtures.generic.trim(),
    );
  });
  it('rule voting is rendered', () => {
    cy.get('.ins-c-rule-details__vote').should(
      'contain',
      'Is this recommendation helpful?',
    );
  });
  it('shows correct total risk and risk of change labels', () => {
    cy.get('.ins-c-rule-details__total-risk').should('contain', 'Critical');
    cy.get('.ins-c-rule-details__risk-of-ch-label').should(
      'have.text',
      'Moderate',
    );
  });
  it('tells that reboot is required', () => {
    cy.get('.ins-c-rule-details__reboot').should(
      'have.text',
      'System reboot is required.',
    );
  });
  it('the request is sent when voted', () => {
    cy.intercept('/api/insights/v1/rating', { statusCode: 200 }).as('rating');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.ouiaId('thumbsUp')
      .click()
      .then(() => {
        cy.wait('@rating');
      });
  });
  it('knowledgebase article has right link', () => {
    cy.contains('a', 'Knowledgebase article')
      .should('have.attr', 'href')
      .and('eq', 'https://access.redhat.com/node/3570921');
  });
});

describe('Tests RuleDetails with envContext', () => {
  it('contains rule rating when displayRuleRating is true', () => {
    mountComponent({
      displayRuleRatings: true,
    });
    cy.contains('Is this recommendation helpful?').should('exist');
  });
  it('has no rule rating when displayRuleRating is false', () => {
    mountComponent({
      displayRuleRatings: false,
    });
    cy.contains('Is this recommendation helpful?').should('not.exist');
  });
});
