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
          <section className="pf-v6-u-p-lg">
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
    </MemoryRouter>,
  );
};

describe('rendering tests', () => {
  describe('defaults', () => {
    const cases = [
      { level: 20, label: 'Low', colorClass: 'pf-m-blue' },
      { level: 50, label: 'Medium', colorClass: 'pf-m-orange' },
      { level: 80, label: 'High', colorClass: 'pf-m-red' },
    ];
    cases.forEach(({ level, label, colorClass }) => {
      it(`${label} recommendation lvl displays correctly`, () => {
        mountComponent(level);
        cy.get('div[class*="pathwayRight"]').contains(`${label} - ${level}%`);
        cy.get('div[class*="pathwayRight"]').find(
          `span[class*="${colorClass}"]`,
        );
      });
    });
  });
});
