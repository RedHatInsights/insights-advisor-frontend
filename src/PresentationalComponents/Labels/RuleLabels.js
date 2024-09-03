import './_RuleLabels.scss';

import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { Label, Tooltip, TooltipPosition } from '@patternfly/react-core';

const RuleLabels = ({ rule, isCompact = true, noMargin }) => {
  return (
    <React.Fragment>
      {rule?.tags?.search('incident') !== -1 && (
        <Tooltip
          content={messages.incidentTooltip.defaultMessage}
          position={TooltipPosition.right}
        >
          <Label
            color="red"
            className={noMargin ? null : 'adv-c-label-incident'}
            isCompact={isCompact}
          >
            {messages.incident.defaultMessage}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === 'disabled' && (
        <Tooltip
          content={messages.ruleIsDisabledTooltip.defaultMessage}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {messages.disabled.defaultMessage}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === 'rhdisabled' && (
        <Tooltip
          content={messages.ruleIsDisabledTooltip.defaultMessage}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {messages.redhatDisabled.defaultMessage}
          </Label>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

RuleLabels.propTypes = {
  rule: PropTypes.object,
  isCompact: PropTypes.bool,
  noMargin: PropTypes.bool,
};

export default RuleLabels;
