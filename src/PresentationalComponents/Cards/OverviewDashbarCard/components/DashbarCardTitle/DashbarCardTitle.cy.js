import React from "react";
import { mount } from "cypress/react";

import { DashbarCardTitle } from "./DashbarCardTitle";
import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../../../../locales/translations.json";
import tooltipMessages from "../../../../../Messages";
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from "../../../../../AppConstants";

// this component returns the appropriate title component based on the title it receives
describe("DashbarCardTitle", () => {
  it("Should render 'Pathways' title with tooltip", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTitle title={PATHWAYS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Pathways/);

    // trigger the tooltip
    // cy.get("[data-cy=question-tooltip]").trigger("mouseover");
    cy.get("[data-cy=question-tooltip]").trigger("focus");
    // cy.get("[data-cy=question-tooltip]").should("exist").trigger("focus");

    // ensure the tooltip message is displayed
    cy.contains(tooltipMessages.recommendedPathways.defaultMessage);

    // ensure that the tooltip message is hidden when the mouse leaves the label
    cy.get("[data-cy=question-tooltip]").trigger("blur");
    cy.contains(tooltipMessages.recommendedPathways.defaultMessage).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should render 'Incidents' title with tooltip", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTitle title={INCIDENTS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Incidents/);

    // trigger the tooltip
    // cy.get("[data-cy=question-tooltip]").trigger("mouseover");
    // cy.get("[data-cy=question-tooltip]").trigger("focus");
    cy.get("[data-cy=question-tooltip]").should("exist").trigger("focus");

    // ensure the tooltip message is displayed
    cy.contains(tooltipMessages.incidentTooltip.defaultMessage);

    // ensure that the tooltip message is hidden when the mouse leaves the label
    cy.get("[data-cy=question-tooltip]").trigger("blur");
    cy.contains(tooltipMessages.incidentTooltip.defaultMessage).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should render 'Important Recommendations' title", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTitle title={IMPORTANT_RECOMMENDATIONS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Important Recommendations/);
  });

  /******************************************************/
  it("Should render 'Critical Recommendations' title", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTitle title={CRITICAL_RECOMMENDATIONS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Critical Recommendations/);
  });

  /******************************************************/
  it("Should not render", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTitle title={"Wrong Card Title"} />
      </IntlProvider>
    );

    // ensure title texts are NOT displayed
    cy.contains(/Pathways/).should("not.exist");
    cy.contains(/Incidents/).should("not.exist");
    cy.contains(/Important Recommendations/).should("not.exist");
    cy.contains(/Critical Recommendations/).should("not.exist");
  });
});
