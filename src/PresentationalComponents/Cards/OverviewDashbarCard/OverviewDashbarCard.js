import React from 'react';
import propTypes from 'prop-types';

import { Card, CardBody, Flex, FlexItem, Text } from '@patternfly/react-core';
import { DashbarCardTitle } from './components/DashbarCardTitle/DashbarCardTitle';
import { DashbarCardTagOrIcon } from './components/DashbarCardTagOrIcon/DashbarCardTagOrIcon';
import { OverviewDashbarCardSupportedTitles } from '../../../AppConstants';

export const OverviewDashbarCard = ({ title, count, onClickFilterByTitle }) => {
  if (OverviewDashbarCardSupportedTitles[title])
    return (
      <Card isFullHeight className="dashbar-item">
        <CardBody>
          <DashbarCardTitle title={title} />

          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
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
    );

  return <></>;
};

OverviewDashbarCard.propTypes = {
  title: propTypes.string,
  count: propTypes.number,
  onClickFilterByTitle: propTypes.func,
};
