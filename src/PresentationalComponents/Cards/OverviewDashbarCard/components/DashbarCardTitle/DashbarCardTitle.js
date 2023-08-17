import React from 'react';
import propTypes from 'prop-types';

import { Text, TextVariants } from '@patternfly/react-core';
import { TitleWithTooltip } from './TitleWithTooltip';
import messages from '../../../../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from '../../../../../AppConstants';

export const DashbarCardTitle = ({ title }) => {
  switch (title) {
    case PATHWAYS:
      return (
        <TitleWithTooltip
          title={messages.pathways}
          tooltipMessage={messages.recommendedPathways}
        />
      );

    case INCIDENTS:
      return (
        <TitleWithTooltip
          title={messages.incidents}
          tooltipMessage={messages.incidentTooltip}
        />
      );

    case IMPORTANT_RECOMMENDATIONS:
    case CRITICAL_RECOMMENDATIONS:
      return (
        <Text component={TextVariants.h4}>
          <b>{title}</b>
        </Text>
      );

    default:
      return null;
  }
};

DashbarCardTitle.propTypes = {
  title: propTypes.string,
};
