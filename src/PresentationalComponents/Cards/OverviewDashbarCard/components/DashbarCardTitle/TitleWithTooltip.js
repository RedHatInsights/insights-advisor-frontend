import React from 'react';
import propTypes from 'prop-types';

import { Title } from '@patternfly/react-core';
import { QuestionTooltip } from '../../../../Common/Common';

// this component returns the title with an appropriate formatted tooltip message that is displayed when hovering over the question mark icon found next to it
export const TitleWithTooltip = ({ title, tooltipMessage }) => {
  return (
    <Title headingLevel="h6" size="md">
      {title} {QuestionTooltip(tooltipMessage)}
    </Title>
  );
};

TitleWithTooltip.propTypes = {
  title: propTypes.string,
  tooltipMessage: propTypes.string,
};
