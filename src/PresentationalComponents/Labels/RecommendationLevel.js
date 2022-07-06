import { Label } from '@patternfly/react-core/dist/js/components/Label/index';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const RecommendationLevel = (props) => {
  const intl = useIntl();
  const { recommendation_level: lvl, isCompact } = props;

  // Another component that is not a component
  const label = (text, lvl, color, isCompact) => (
    <Label color={color} isCompact={isCompact}>{`${text} - ${lvl}%`}</Label>
  );

  // There should preferably only be one return
  // Maybe we can rework this to not have this if..else if...else...
  if (lvl >= 80) {
    return label(intl.formatMessage(messages.high), lvl, 'red', isCompact);
  } else if (lvl < 80 && lvl >= 50) {
    return label(intl.formatMessage(messages.medium), lvl, 'orange', isCompact);
  } else {
    return label(intl.formatMessage(messages.low), lvl, 'blue', isCompact);
  }
};

RecommendationLevel.propTypes = {
  props: PropTypes.array,
};

export default RecommendationLevel;
