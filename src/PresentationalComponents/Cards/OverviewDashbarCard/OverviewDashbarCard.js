import React from 'react';
import propTypes from 'prop-types';

import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Skeleton,
  Content,
} from '@patternfly/react-core';

export const OverviewDashbarCard = ({
  name,
  isLoaded,
  title,
  badge,
  count,
  onClickFilterByName,
}) => (
  <Card isFullHeight className="dashbar-item" ouiaId="overview-dashbar-card">
    <CardBody>
      {title}

      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>{badge}</FlexItem>
        <FlexItem>
          {isLoaded ? (
            <Content
              component="p"
              className="pf-v6-u-font-size-lg pf-v6-u-font-weight-bold pf-v6-u-mt-xs"
            >
              <a onClick={() => onClickFilterByName(name)} data-testid={name}>
                {count}
              </a>
            </Content>
          ) : (
            <Skeleton width="50px" className="pf-v6-u-mt-xs" />
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
