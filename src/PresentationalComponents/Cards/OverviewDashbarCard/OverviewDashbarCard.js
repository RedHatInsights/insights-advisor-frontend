import React from 'react';
import propTypes from 'prop-types';

import { Card, CardBody, Flex, FlexItem, Text } from '@patternfly/react-core';
import { DashbarCardTitle } from './components/DashbarCardTitle/DashbarCardTitle';
import { DashbarCardTagOrIcon } from './components/DashbarCardTagOrIcon/DashbarCardTagOrIcon';

export const OverviewDashbarCard = ({ title, count, onClickFilterByTitle }) => (
  <Card isFullHeight className="dashbar-item">
    <CardBody>
      <DashbarCardTitle title={title} />

      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <DashbarCardTagOrIcon title={title} />
        </FlexItem>
        <FlexItem>
          <Text className="pf-v5-u-font-size-lg pf-v5-u-font-weight-bold pf-v5-u-mt-xs">
            <a onClick={() => onClickFilterByTitle(title)} data-testid={title}>
              {count}
            </a>
          </Text>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);

OverviewDashbarCard.propTypes = {
  title: propTypes.string,
  count: propTypes.number,
  onClickFilterByTitle: propTypes.func,
};
