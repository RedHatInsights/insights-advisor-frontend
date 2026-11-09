import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import { RelativeTimeWithTooltip } from '../../Utilities/dateHelpers';
import { IMPACT_LABEL, LIKELIHOOD_LABEL } from '../../AppConstants';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { EnvironmentContext } from '../../App';

export const RecommendationCell = (props) => {
  const { rule, generateRuleUrl } = props;
  const envContext = useContext(EnvironmentContext);
  const intl = useIntl();

  if (!rule) {
    return null;
  }

  return (
    <span>
      {envContext?.loadChromeless ? (
        <a
          href={
            generateRuleUrl
              ? generateRuleUrl(rule.rule_id)
              : `/foreman_rh_cloud/recommendations/${rule.rule_id}`
          }
        >
          {rule.description}
        </a>
      ) : (
        <InsightsLink app="advisor" to={`/recommendations/${rule.rule_id}`}>
          {rule.description}
        </InsightsLink>
      )}
      <RuleLabels rule={rule} intl={intl} isCompact />
    </span>
  );
};

RecommendationCell.propTypes = {
  rule: PropTypes.object,
  generateRuleUrl: PropTypes.func,
};

export const ModifiedCell = ({ rule }) => {
  if (!rule?.publish_date) {
    return null;
  }
  return <RelativeTimeWithTooltip date={rule.publish_date} />;
};

ModifiedCell.propTypes = {
  rule: PropTypes.object,
};

export const FirstImpactedCell = ({ impacted_date }) => {
  if (!impacted_date) {
    return null;
  }
  return <RelativeTimeWithTooltip date={impacted_date} />;
};

FirstImpactedCell.propTypes = {
  impacted_date: PropTypes.string,
};

export const TotalRiskCell = ({ rule }) => {
  if (!rule) {
    return null;
  }

  return (
    <div style={{ verticalAlign: 'top' }}>
      <Tooltip
        position={TooltipPosition.bottom}
        content={
          <span>
            The <strong>likelihood</strong> that this will be a problem is{' '}
            {LIKELIHOOD_LABEL[rule.likelihood]}. The <strong>impact</strong> of
            the problem would be &nbsp;
            {IMPACT_LABEL[rule.impact?.impact || rule.impact]} if it occurred.
          </span>
        }
      >
        <InsightsLabel value={rule.total_risk} isCompact />
      </Tooltip>
    </div>
  );
};

TotalRiskCell.propTypes = {
  rule: PropTypes.object,
};

export const RemediationCell = ({ resolution }) => {
  const intl = useIntl();

  return (
    <div className="ins-c-center-text">
      {resolution === null || resolution === undefined ? (
        intl.formatMessage(messages.notAvailable)
      ) : resolution?.has_playbook ? (
        <span>{intl.formatMessage(messages.playbook)}</span>
      ) : (
        intl.formatMessage(messages.manual)
      )}
    </div>
  );
};

RemediationCell.propTypes = {
  resolution: PropTypes.object,
};
