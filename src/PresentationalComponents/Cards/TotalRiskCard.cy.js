import React from 'react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { initStore } from '../../Store';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import { TotalRiskCard } from './TotalRiskCard';
import pathwayFixtures from '../../../cypress/fixtures/pathway_upgrade_kernel.json';

const mountComponent = () => {
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0.2)}>
        <Provider store={initStore()}>
          <section className="pf-v5-u-p-lg">
            <Grid hasGutter>
              <GridItem sm={12} md={6}>
                <TotalRiskCard {...pathwayFixtures} />
              </GridItem>
            </Grid>
          </section>
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('rendering tests', () => {
  describe('defaults', () => {
    it('Total risk card displays', () => {
      mountComponent();
      cy.get('div[class*=body]').contains(
        'This pathway is expected to improve Availability, Security, Stability, Performance on 257 systems and resolve 0 incidents.'
      );
      cy.get('g[role="presentation"').contains('Critical');
      cy.get('g[role="presentation"').contains('Important');
      cy.get('g[role="presentation"').contains('Moderate');
      cy.get('g[role="presentation"').contains('Low');
    });
  });
});
