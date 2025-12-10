import React from 'react';
import propTypes from 'prop-types';

import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Skeleton,
  Text,
} from '@patternfly/react-core';

/**
 * Dashboard card component for displaying a single metric in the IoP overview.
 * Uses a flat card design with transparent background. Displays a title, badge,
 * and clickable count that can be used to filter data.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Metric name identifier used for filtering
 * @param {boolean} props.isLoaded - Whether the data has finished loading
 * @param {React.ReactNode} props.title - Title content to display (typically a Title component)
 * @param {React.ReactNode} props.badge - Badge/label element to display (typically severity or category badge)
 * @param {number} props.count - Numeric count to display for this metric
 * @param {Function} props.onClickFilterByName - Callback fired when count is clicked, receives name parameter
 * @returns {React.ReactElement} Flat card component with metric information
 *
 * @example
 * <IopOverviewDashbarCard
 *   name="critical"
 *   isLoaded={true}
 *   title={<Title>Critical Recommendations</Title>}
 *   badge={<SeverityBadge severity="critical" />}
 *   count={42}
 *   onClickFilterByName={(name) => applyFilter(name)}
 * />
 */
export const IopOverviewDashbarCard = ({
  name,
  isLoaded,
  title,
  badge,
  count,
  onClickFilterByName,
}) => (
  <Card
    isFlat
    isFullHeight
    className="dashbar-item"
    ouiaId="overview-dashbar-card"
  >
    <CardBody>
      {title}

      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>{badge}</FlexItem>
        <FlexItem>
          {isLoaded ? (
            <Text className="pf-v5-u-font-size-lg pf-v5-u-font-weight-bold pf-v5-u-mt-xs">
              <a onClick={() => onClickFilterByName(name)} data-testid={name}>
                {count}
              </a>
            </Text>
          ) : (
            <Skeleton width="50px" className="pf-v5-u-mt-xs" />
          )}
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);

IopOverviewDashbarCard.propTypes = {
  name: propTypes.string,
  isLoaded: propTypes.bool,
  title: propTypes.node,
  badge: propTypes.node,
  count: propTypes.number,
  onClickFilterByName: propTypes.func,
};
