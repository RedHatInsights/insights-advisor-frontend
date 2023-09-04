import React from "react";
import { Provider } from "react-redux";
import { mount } from "cypress/react";

import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../locales/translations.json";
import OverviewDashbar from "./OverviewDashbar";
import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from "../../AppConstants";
import { getStore } from "../../Store";

describe("OverviewDashbar", () => {
  it("Should render", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <Provider store={getStore()}>
          <OverviewDashbar changeTab={cy.stub().as("changeTab")} />
        </Provider>
      </IntlProvider>
    );

    /***************/
    // cy.findByTestId("employee-wizard-drawer-cancel").click();
    // cy.get('[data-test-id="employee-wizard-drawer-close"]').click();

    // ensure that the correct text is displayed:
    // cy.contains(/Pathways/);

    // trigger the tooltip:
    // cy.get("[data-cy=question-tooltip]").trigger("mouseover");
    // cy.get("[data-cy=question-tooltip]").trigger("focus");
    /***************/

    // ensure the correct text is displayed & press the buttons and check the outcome
    cy.contains(/Pathways/).click();
    cy.get("@changeTab").should("have.been.calledWith", PATHWAYS_TAB);

    cy.contains(/Incidents/).click();
    cy.get("@changeTab").should("have.been.calledWith", RECOMMENDATIONS_TAB);

    cy.contains(/Important Recommendations/).click();
    cy.get("@changeTab").should("have.been.calledWith", RECOMMENDATIONS_TAB);

    cy.contains(/Critical Recommendations/).click();
    cy.get("@changeTab").should("have.been.calledWith", RECOMMENDATIONS_TAB);
  });
});
