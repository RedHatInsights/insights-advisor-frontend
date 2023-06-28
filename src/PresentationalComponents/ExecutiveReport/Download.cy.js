import React from 'react';

import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';
import DownloadExecReport from './Download';
import { pdfReportInterceptors } from '../../../cypress/support/interceptors';
import notifications from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import * as helpers from '../../Utilities/Helpers';

const mountComponent = (props) => {
  const store = getStore();
  cy.mount(
    <IntlProvider locale={navigator.language.slice(0, 2)}>
      <Provider store={store}>
        <DownloadExecReport {...props} />
      </Provider>
    </IntlProvider>
  );
};

describe('DownloadExecReport', () => {
  beforeEach(() => {
    cy.stub(helpers, 'renderPDF').callsFake(() => {});
  });
  it('Should render with button enabled state', () => {
    mountComponent({ isDisabled: false });
    cy.get('.pf-c-button').should('have.length', 1);
    cy.get('body').screenshot();
  });
  it('Should render with button disabled state', () => {
    mountComponent({ isDisabled: true });
    cy.get('.pf-c-button.pf-m-disabled').should('have.length', 1);
  });
  it('Should download PDF report with notifications', () => {
    cy.spy(notifications, 'addNotification');
    pdfReportInterceptors['successful with pdf blob']();
    mountComponent({ isDisabled: false });
    cy.get('.pf-c-button').click();
    cy.wait('@generateReport')
      .its('request.url')
      .should('include', `api/crc-pdf-generator/v1/generate`);
  });
});
