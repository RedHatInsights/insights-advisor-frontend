import React from 'react';
import {
  IMPACT_LABEL,
  IMPACT_LABEL_LOWER,
  LIKELIHOOD_LABEL,
  LIKELIHOOD_LABEL_LOWER,
  RISK_OF_CHANGE_LABEL,
  TOTAL_RISK_LABEL_LOWER,
} from '../AppConstants';
import messages from '../Messages';
import { ruleResolutionRisk } from '../PresentationalComponents/Common/Tables';

// ok.
export const strong = (str) => <strong>{str}</strong>;

// takes `messageIds` list and formats the messages using `values`
export const formatMessages = (intl, messageIds, values) =>
  Object.fromEntries(
    messageIds.map((id) => [
      id,
      messages[id] ? intl.formatMessage(messages[id], values[id]) : '',
    ])
  );

export const mapContentToValues = (intl, rule) => ({
  viewAffectedSystems: {
    systems: rule.impacted_systems_count,
  },
  impactLevel: { level: IMPACT_LABEL[rule.impact?.impact] },
  impactDescription: {
    level: IMPACT_LABEL_LOWER[rule.impact?.impact],
  },
  rulesDetailsTotalRiskBody: {
    risk:
      TOTAL_RISK_LABEL_LOWER[rule.total_risk] ||
      intl.formatMessage(messages.undefined),
    strong,
  },
  likelihoodLevel: {
    level: LIKELIHOOD_LABEL[rule.likelihood],
  },
  likelihoodDescription: {
    level: LIKELIHOOD_LABEL_LOWER[rule.likelihood],
  },
  systemReboot: {
    strong: (str) => strong(str),
    status: rule.reboot_required
      ? intl.formatMessage(messages.is)
      : intl.formatMessage(messages.isNot),
  },
  riskOfChangeText: {
    strong: (str) => strong(str),
    level: RISK_OF_CHANGE_LABEL[ruleResolutionRisk(rule)],
  },
  riskOfChangeLabel: {
    level: RISK_OF_CHANGE_LABEL[ruleResolutionRisk(rule)],
  },
});
