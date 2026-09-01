import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Stack, StackItem, Button } from '@patternfly/react-core';
import { BellSlashIcon } from '@patternfly/react-icons';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import { Link } from 'react-router-dom';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  AdvisorProduct,
  RISK_OF_CHANGE_DESC,
  SYSTEM_TYPES,
} from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import messages from '../../Messages';
import ViewHostAcks from '../Modals/ViewHostAcks';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { useIntl } from 'react-intl';

// Helper to determine resolution risk from rule data (resolution_set or direct property)
const ruleResolutionRisk = (rule) => {
  if (rule?.resolution_set?.length) {
    const resolution =
      rule.resolution_set.find(
        (res) =>
          res.system_type === SYSTEM_TYPES.rhel ||
          res.system_type === SYSTEM_TYPES.ocp,
      ) || rule.resolution_set[0];
    if (resolution?.resolution_risk?.risk) {
      return resolution.resolution_risk.risk;
    }
  }
  if (typeof rule?.resolution_risk === 'object' && rule.resolution_risk?.risk) {
    return rule.resolution_risk.risk;
  }
  return Number(rule?.resolution_risk || rule?.res_risk) || undefined;
};

/**
 * Expandable row content for RulesTable
 * Shows detailed recommendation information including:
 * - Number of systems with rule disabled
 * - Full rule details (description, tags, KCS articles, etc.)
 * - Link to view affected systems
 *
 * @param {Object} props
 * @param {Object} props.item - The rule data
 * @returns {React.Element}
 */
const RuleDetailsWrapper = ({ item }) => {
  const rule = item;
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);

  const resolutionRisk = ruleResolutionRisk(rule);
  const rebootRequired =
    rule.reboot_required ??
    rule.resolution_set?.find(
      (res) =>
        res.system_type === SYSTEM_TYPES.rhel ||
        res.system_type === SYSTEM_TYPES.ocp,
    )?.has_reboot ??
    rule.resolution_set?.[0]?.has_reboot ??
    false;

  const normalizedRule = {
    ...rule,
    reboot_required: rebootRequired,
  };

  const ruleDetailsContent = (
    <RuleDetails
      messages={formatMessages(
        intl,
        RuleDetailsMessagesKeys,
        mapContentToValues(intl, normalizedRule),
      )}
      product={'rhel'}
      rule={normalizedRule}
      resolutionRisk={resolutionRisk}
      resolutionRiskDesc={RISK_OF_CHANGE_DESC[resolutionRisk]}
      isDetailsPage={false}
      showViewAffected
      ViewAffectedLink={
        rule.rule_status === 'enabled' &&
        (envContext?.loadChromeless ? (
          <Link to={`/foreman_rh_cloud/recommendations/${rule.rule_id}`}>
            {rule.impacted_systems_count === 0
              ? ''
              : intl.formatMessage(messages.viewAffectedSystems, {
                  systems: rule.impacted_systems_count,
                })}
          </Link>
        ) : (
          <InsightsLink to={`/recommendations/${rule.rule_id}`}>
            {rule.impacted_systems_count === 0
              ? ''
              : intl.formatMessage(messages.viewAffectedSystems, {
                  systems: rule.impacted_systems_count,
                })}
          </InsightsLink>
        ))
      }
      knowledgebaseUrl={
        rule.node_id ? `https://access.redhat.com/node/${rule.node_id}` : ''
      }
    />
  );

  return (
    <>
      {rule.hosts_acked_count ? (
        <Stack hasGutter>
          <StackItem>
            <BellSlashIcon size="sm" />
            &nbsp;
            {rule.hosts_acked_count && !rule.impacted_systems_count
              ? intl.formatMessage(messages.ruleIsDisabledForAllSystems)
              : intl.formatMessage(messages.ruleIsDisabledForSystemsBody, {
                  systems: rule.hosts_acked_count,
                })}
            &nbsp;{' '}
            <Button
              isInline
              variant="link"
              ouiaId="viewSystem"
              onClick={() => setViewSystemsModalOpen(true)}
            >
              {intl.formatMessage(messages.viewSystems)}
            </Button>
          </StackItem>
          {ruleDetailsContent}
        </Stack>
      ) : (
        ruleDetailsContent
      )}
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={() => setViewSystemsModalOpen(false)}
          isModalOpen={viewSystemsModalOpen}
          rule={rule}
        />
      )}
    </>
  );
};

RuleDetailsWrapper.propTypes = {
  item: PropTypes.object.isRequired,
};

export default RuleDetailsWrapper;
