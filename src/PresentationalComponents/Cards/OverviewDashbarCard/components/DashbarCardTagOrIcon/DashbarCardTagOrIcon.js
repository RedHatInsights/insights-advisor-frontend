import React from "react";
import propTypes from "prop-types";

import { RouteIcon } from "@patternfly/react-icons";
import { TagLabelWithTooltip } from "./TagLabelWithTooltip";
import RuleLabels from "../../../../Labels/RuleLabels";
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  INCIDENT_TAG,
  IMPORTANT_TAG,
  CRITICAL_TAG,
  SEVERITY_MAP,
} from "../../../../../AppConstants";

export const DashbarCardTagOrIcon = ({ title }) => {
  switch (title) {
    case PATHWAYS:
      return <RouteIcon size="md" data-cy="route-icon" />;
    case INCIDENTS:
      return (
        <RuleLabels key="incidentTag" rule={{ tags: INCIDENT_TAG }} isCompact />
      );
    case CRITICAL_RECOMMENDATIONS:
      return <TagLabelWithTooltip typeOfTag={SEVERITY_MAP[CRITICAL_TAG]} />;
    case IMPORTANT_RECOMMENDATIONS:
      return <TagLabelWithTooltip typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]} />;

    default:
      return null;
  }
};

DashbarCardTagOrIcon.propTypes = {
  title: propTypes.string,
};
