import React from 'react';
import { useIntl } from 'react-intl';
import propTypes from 'prop-types';

import { Title } from '@patternfly/react-core';
import { QuestionTooltip } from '../../../../Common/Common';

// this component returns the title with an appropriate formatted tooltip message that is displayed when hovering over the question mark icon found next to it
export const TitleWithTooltip = ({ title, tooltipMessage }) => {
  const { formatMessage } = useIntl();

  return (
    <Title headingLevel="h6" size="md">
      {formatMessage(title)} {QuestionTooltip(formatMessage(tooltipMessage))}
    </Title>
  );
};

TitleWithTooltip.propTypes = {
  title: propTypes.shape({
    id: propTypes.string,
    description: propTypes.string,
    defaultMessage: propTypes.string,
  }),
  tooltipMessage: propTypes.shape({
    id: propTypes.string,
    description: propTypes.string,
    defaultMessage: propTypes.string,
  }),
};
