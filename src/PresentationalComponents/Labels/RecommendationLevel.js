import { Label } from '@patternfly/react-core/dist/js/components/Label/index';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const RecommendationLevel = (props) => {
  const intl = useIntl();
  const { recommendation_level: lvl } = props;

  const label = (text, lvl, color) => (
    <Label color={color} isCompact>{`${text} - ${lvl}%`}</Label>
  );

  if (lvl >= 80) {
    return label(intl.formatMessage(messages.high), lvl, 'red');
  } else if (lvl < 80 && lvl >= 50) {
    return label(intl.formatMessage(messages.medium), lvl, 'orange');
  } else {
    return label(intl.formatMessage(messages.low), lvl, 'blue');
  }
};

RecommendationLevel.propTypes = {
  props: PropTypes.array,
};

export default RecommendationLevel;
