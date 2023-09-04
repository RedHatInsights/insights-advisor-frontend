import React from "react";
import propTypes from "prop-types";

import { Card, CardBody, Flex, FlexItem, Text } from "@patternfly/react-core";
import { DashbarCardTitle } from "./components/DashbarCardTitle/DashbarCardTitle";
import { DashbarCardTagOrIcon } from "./components/DashbarCardTagOrIcon/DashbarCardTagOrIcon";
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from "../../../AppConstants";

// this component returns the appropriate Card component based on the title it receives
export const OverviewDashbarCard = ({ title, count, onClickFilterByTitle }) => {
  const isWrongTitle =
    title != PATHWAYS &&
    title != INCIDENTS &&
    title != IMPORTANT_RECOMMENDATIONS &&
    title != CRITICAL_RECOMMENDATIONS;

  return (
    !isWrongTitle && (
      <Card isFullHeight className="dashbar-item">
        <CardBody>
          <DashbarCardTitle title={title} />

          <Flex spaceItems={{ default: "spaceItemsSm" }}>
            <FlexItem>
              <DashbarCardTagOrIcon title={title} />
            </FlexItem>
            <FlexItem>
              <Text className="pf-u-font-size-lg pf-u-font-weight-bold pf-u-mt-xs">
                <a
                  onClick={() => onClickFilterByTitle(title)}
                  data-testid={title}
                >
                  {count}
                </a>
              </Text>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    )
  );
};

OverviewDashbarCard.propTypes = {
  title: propTypes.string,
  count: propTypes.number,
  onClickFilterByTitle: propTypes.func,
};
