import "./_RuleLabels.scss";

import { Tooltip, TooltipPosition, Label } from "@patternfly/react-core";

import PropTypes from "prop-types";
import React from "react";
import messages from "../../Messages";
import { useIntl } from "react-intl";

const RuleLabels = ({ rule, isCompact, noMargin }) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      {rule?.tags?.search("incident") !== -1 && (
        <Tooltip
          content={intl.formatMessage(messages.incidentTooltip)}
          position={TooltipPosition.right}
        >
          <Label
            color="red"
            className={noMargin ? null : "adv-c-label-incident"}
            isCompact={isCompact}
          >
            {intl.formatMessage(messages.incident)}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === "disabled" && (
        <Tooltip
          content={intl.formatMessage(messages.ruleIsDisabledTooltip)}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {intl.formatMessage(messages.disabled)}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === "rhdisabled" && (
        <Tooltip
          content={intl.formatMessage(messages.ruleIsDisabledTooltip)}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {intl.formatMessage(messages.redhatDisabled)}
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

RuleLabels.defaultProps = {
  isCompact: true,
};

export default RuleLabels;
