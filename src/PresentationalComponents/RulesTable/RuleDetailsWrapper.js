import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { ruleResolutionRisk } from '../Common/Tables';
import * as AppConstants from '../../AppConstants';
import { useIntl } from 'react-intl';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import messages from '../../Messages';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/esm/layouts/Stack';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import BellSlashIcon from '@patternfly/react-icons/dist/esm/icons/bell-slash-icon';
import ViewHostAcks from '../Modals/ViewHostAcks';

/**
 * Wrapper component for RuleDetails expandable row content
 *
 * Used as detailsComponent in TableToolsTable options.
 * Displays full recommendation details with:
 * - Disabled systems notification (if applicable)
 * - RuleDetails component with resolution info
 * - ViewHostAcks modal
 *
 * @param {Object} props
 * @param {Object} props.item - Rule/recommendation object
 */
const RuleDetailsWrapper = ({ item }) => {
  const intl = useIntl();
  const rule = item;
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);

  return (
    <>
      <section className="pf-v6-c-page__main-section pf-m-light">
        <Stack hasGutter>
          {rule.hosts_acked_count > 0 && (
            <StackItem>
              <BellSlashIcon size="sm" />
              &nbsp;
              {rule.hosts_acked_count && !rule.impacted_systems_count
                ? intl.formatMessage(messages.ruleIsDisabledForAllSystems)
                : intl.formatMessage(messages.ruleIsDisabledForSystemsBody, {
                    systems: rule.hosts_acked_count,
                  })}
              &nbsp;
              <Button
                isInline
                variant="link"
                ouiaId="viewSystem"
                onClick={() => setViewSystemsModalOpen(true)}
              >
                {intl.formatMessage(messages.viewSystems)}
              </Button>
            </StackItem>
          )}
          <StackItem>
            <RuleDetails
              messages={formatMessages(
                intl,
                RuleDetailsMessagesKeys,
                mapContentToValues(intl, rule),
              )}
              product={AdvisorProduct.rhel}
              rule={rule}
              resolutionRisk={ruleResolutionRisk(rule)}
              resolutionRiskDesc={
                AppConstants.RISK_OF_CHANGE_DESC[ruleResolutionRisk(rule)]
              }
              isDetailsPage={false}
              showViewAffected
              ViewAffectedLink={
                rule.rule_status === 'enabled' &&
                rule.impacted_systems_count > 0 ? (
                  <InsightsLink to={`/recommendations/${rule.rule_id}`}>
                    {intl.formatMessage(messages.viewAffectedSystems, {
                      systems: rule.impacted_systems_count,
                    })}
                  </InsightsLink>
                ) : null
              }
              knowledgebaseUrl={
                rule.node_id
                  ? `https://access.redhat.com/node/${rule.node_id}`
                  : ''
              }
            />
          </StackItem>
        </Stack>
      </section>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(isOpen) => setViewSystemsModalOpen(isOpen)}
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
