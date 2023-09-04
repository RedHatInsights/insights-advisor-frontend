import React from "react";
import { mount } from "cypress/react";

import { DashbarCardTagOrIcon } from "./DashbarCardTagOrIcon";
import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../../../../locales/translations.json";
import tooltipMessages from "../../../../../Messages";
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from "../../../../../AppConstants";

// This component returns the appropriate Tag OR Icon component based on the title it receives
describe("DashbarCardTagOrIcon", () => {
  it("Should render a 'Route' icon", () => {
    mount(<DashbarCardTagOrIcon title={PATHWAYS} />);

    // ensure the 'Route' icon is displayed
    cy.get("[data-cy=route-icon]").should("exist");
  });

  /******************************************************/
  it("Should render 'Incidents' label", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTagOrIcon title={INCIDENTS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Incident/).trigger("focus");
    cy.contains(tooltipMessages.incidentTooltip.defaultMessage);

    // ensure that the tooltip message is hidden
    cy.contains(/Incident/).trigger("blur");
    cy.contains(tooltipMessages.incidentTooltip.defaultMessage).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should render 'Important Recommendations' label", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTagOrIcon title={IMPORTANT_RECOMMENDATIONS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Important/).trigger("focus");
    cy.contains(/The total risk of this remediation is important/);

    // ensure the tooltip message is hidden
    cy.contains(/Important/).trigger("blur");
    cy.contains(/The total risk of this remediation is important/).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should render 'Critical Recommendations' label", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTagOrIcon title={CRITICAL_RECOMMENDATIONS} />
      </IntlProvider>
    );

    // ensure the correct text is displayed
    cy.contains(/Critical/).trigger("focus");
    cy.contains(/The total risk of this remediation is critical/);

    // ensure that the tooltip message is hidden
    cy.contains(/Critical/).trigger("blur");
    cy.contains(/The total risk of this remediation is critical/).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should not render", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <DashbarCardTagOrIcon title={"Wrong Card Title"} />
      </IntlProvider>
    );

    // ensure the 'Route' icon is not displayed
    cy.get("[data-cy=route-icon]").should("not.exist");

    // ensure non of the labels is displayed
    cy.contains(/Incidents/).should("not.exist");
    cy.contains(/Important/).should("not.exist");
    cy.contains(/Critical/).should("not.exist");
  });
});
