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

export const OverviewDashbarCard = ({
  name,
  isLoaded,
  title,
  badge,
  count,
  onClickFilterByName,
}) => (
  <Card isFullHeight className="dashbar-item">
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

OverviewDashbarCard.propTypes = {
  name: propTypes.string,
  isLoaded: propTypes.bool,
  title: propTypes.node,
  badge: propTypes.node,
  count: propTypes.number,
  onClickFilterByName: propTypes.func,
};
