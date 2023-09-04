import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../../../locales/translations.json";

import { OverviewDashbarCard } from "../OverviewDashbarCard";
import { PATHWAYS } from "../../../../AppConstants";

describe("OverviewDashbarCard", () => {
  it("Should render", async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <OverviewDashbarCard
          title={PATHWAYS}
          count={1}
          onClickFilterByTitle={onClickFilterByTitle}
        />
      </IntlProvider>
    );

    // ensure that the correct text is displayed
    await expect(screen.getByText(PATHWAYS)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();

    // ensure filtering is called by clicking the count
    const filterByTitleBtn = screen.getByTestId(PATHWAYS);

    fireEvent.click(filterByTitleBtn);
    expect(onClickFilterByTitle).toHaveBeenCalledWith(PATHWAYS);
  });

  /*********************************************************************/
  it("Should not render", () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={"Wrong Card Title"}
        count={2}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );

    // ensure that nothing is displayed
    expect(screen.queryByText(/Wrong Card Title/)).toBe(null);
    expect(screen.queryByText(/2/)).toBe(null);
    expect(screen.queryByTestId(/Wrong Card Title/)).toBe(null);

    // ensure filtering is not called
    expect(onClickFilterByTitle).toHaveBeenCalledTimes(0);
  });
});
