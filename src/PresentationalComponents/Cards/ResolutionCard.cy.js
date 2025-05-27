import React from 'react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ResolutionCard } from './ResolutionCard';
import { initStore } from '../../Store';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';

const mountComponent = (lvl) => {
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0.2)}>
        <Provider store={initStore()}>
          <section className="pf-v5-u-p-lg">
            <Grid hasGutter>
              <GridItem sm={12} md={6}>
                <ResolutionCard
                  name="abc"
                  resolution_risk="2"
                  recommendation_level={lvl}
                />
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
    it('Low recommendation lvl displays correctly', () => {
      // 20
      mountComponent(20);
      cy.get('div[class*="pathwayRight"]').contains('Low - 20%');
      cy.get('div[class*="pathwayRight"]').find('span[class*="pf-m-blue"]');
    });
    it('Medium recommendation lvl displays correctly', () => {
      // 50
      mountComponent(50);
      cy.get('div[class*="pathwayRight"]').contains('Medium - 50%');
      cy.get('div[class*="pathwayRight"]').find('span[class*="pf-m-orange"]');
    });
    it('High recommendation lvl displays correctly', () => {
      // 80
      mountComponent(80);
      cy.get('div[class*="pathwayRight"]').contains('High - 80%');
      cy.get('div[class*="pathwayRight"]').find('span[class*="pf-m-red"]');
    });
  });
});
