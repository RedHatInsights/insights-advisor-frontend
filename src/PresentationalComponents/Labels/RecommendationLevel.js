import { Label } from '@patternfly/react-core/dist/esm/components/Label/index';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

export const RecommendationLevel = ({ recLvl, isCompact = true }) => {
  const intl = useIntl();
  const label = (text, recLvl, color) => (
    <Label color={color} isCompact>{`${text} - ${recLvl}%`}</Label>
  );

  if (recLvl >= 80) {
    return label(intl.formatMessage(messages.high), recLvl, 'red', isCompact);
  } else if (recLvl < 80 && recLvl >= 50) {
    return label(
      intl.formatMessage(messages.medium),
      recLvl,
      'orange',
      isCompact,
    );
  } else {
    return label(intl.formatMessage(messages.low), recLvl, 'blue', isCompact);
  }
};

RecommendationLevel.propTypes = {
  recLvl: PropTypes.number,
  isCompact: PropTypes.bool,
};

export default RecommendationLevel;
