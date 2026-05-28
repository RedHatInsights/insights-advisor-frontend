import React from 'react';
import PropTypes from 'prop-types';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import CategoryLabel from '../Labels/CategoryLabel';
import RuleLabels from '../Labels/RuleLabels';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import * as AppConstants from '../../AppConstants';

/**
 * Cell component for Recommendation name/description
 * Shows: Link to recommendation + RuleLabels (incident, playbook, etc.)
 */
export const RecommendationCell = (props) => {
  const { rule_id, description } = props;

  return (
    <span>
      <InsightsLink to={`/recommendations/${rule_id}`}>
        {description}
      </InsightsLink>
      <RuleLabels rule={props} isCompact />
    </span>
  );
};

RecommendationCell.propTypes = {
  rule_id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

/**
 * Cell component for Modified date
 * Shows: Relative date format (e.g., "2 days ago")
 */
export const ModifiedCell = ({ publish_date }) => {
  return <DateFormat date={publish_date} variant="relative" />;
};

ModifiedCell.propTypes = {
  publish_date: PropTypes.string.isRequired,
};

/**
 * Cell component for Category
 * Shows: Category icon + label
 */
export const CategoryCell = ({ category }) => {
  return <CategoryLabel labelList={[category]} isCompact />;
};

CategoryCell.propTypes = {
  category: PropTypes.object.isRequired,
};

/**
 * Cell component for Total Risk
 * Shows: Risk badge with tooltip explanation
 */
export const TotalRiskCell = ({ total_risk }) => {
  return (
    <Tooltip
      position={TooltipPosition.bottom}
      content={
        <>
          The total risk of this remediation is
          <strong> {AppConstants.TOTAL_RISK_LABEL_LOWER[total_risk]}</strong>,
          based on the combination of likelihood and impact to remediate.
        </>
      }
    >
      <InsightsLabel value={total_risk} isCompact />
    </Tooltip>
  );
};

TotalRiskCell.propTypes = {
  total_risk: PropTypes.number.isRequired,
};

/**
 * Cell component for Systems Exposed count
 * Shows: Link to recommendation (if enabled) or plain count (if disabled)
 */
export const SystemsCell = ({
  rule_status,
  rule_id,
  impacted_systems_count,
}) => {
  if (rule_status !== 'enabled') {
    return <span>{impacted_systems_count}</span>;
  }

  return (
    <InsightsLink to={`/recommendations/${rule_id}`}>
      {impacted_systems_count.toLocaleString()}
    </InsightsLink>
  );
};

SystemsCell.propTypes = {
  rule_status: PropTypes.string.isRequired,
  rule_id: PropTypes.string.isRequired,
  impacted_systems_count: PropTypes.number.isRequired,
};

/**
 * Cell component for Remediation type
 * Shows: "Playbook" or "Manual" based on playbook_count
 */
export const RemediationCell = ({ playbook_count }) => {
  return (
    <div className="ins-c-center-text">
      {playbook_count ? 'Playbook' : 'Manual'}
    </div>
  );
};

RemediationCell.propTypes = {
  playbook_count: PropTypes.number.isRequired,
};
