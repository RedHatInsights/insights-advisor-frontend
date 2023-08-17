import React from "react";
import { mount } from "cypress/react";

import { TagLabelWithTooltip } from "./TagLabelWithTooltip";
import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../../../../locales/translations.json";

import {
  SEVERITY_MAP,
  CRITICAL_TAG,
  IMPORTANT_TAG,
} from "../../../../../AppConstants";

// This component returns an "Important" or "Critical" label with an appropriate formatted tooltip message
// It receives a typeOfTag prop, which is a number, and uses it to get the appropriate label and corresponding tooltip message
describe("TagLabelWithTooltip", () => {
  it("Should render 'Critical' label", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <TagLabelWithTooltip typeOfTag={SEVERITY_MAP[CRITICAL_TAG]} />
      </IntlProvider>
    );

    // ensure that the tooltip text is displayed
    cy.contains(/Critical/).trigger("focus");
    cy.contains(/The total risk of this remediation is critical/);

    // ensure that the tooltip message is hidden when the mouse leaves the label
    cy.contains(/Critical/).trigger("blur");
    cy.contains(/The total risk of this remediation is critical/).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should render 'Important' label", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <TagLabelWithTooltip typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]} />
      </IntlProvider>
    );

    // ensure that the tooltip text is displayed
    cy.contains(/Important/).trigger("focus");
    cy.contains(/The total risk of this remediation is important/);

    // ensure the tooltip message is hidden when the mouse leaves the label
    cy.contains(/Important/).trigger("blur");
    cy.contains(/The total risk of this remediation is important/).should(
      "not.exist"
    );
  });

  /******************************************************/
  it("Should not render 'Important' or 'Critical' labels", () => {
    mount(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <TagLabelWithTooltip
          typeOfTag={SEVERITY_MAP["non-existing-severity-tag"]}
        />
      </IntlProvider>
    );

    // ensure the texts of both labels is NOT displayed
    cy.contains(/Important/).should("not.exist");
    cy.contains(/Critical/).should("not.exist");
  });
});
