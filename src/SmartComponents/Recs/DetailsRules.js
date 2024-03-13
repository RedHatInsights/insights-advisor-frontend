/* eslint-disable react/prop-types */
import React from 'react';
import { BASE_URL, RISK_OF_CHANGE_DESC } from '../../AppConstants';
import { Post } from '../../Utilities/Api';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import { CaretDownIcon } from '@patternfly/react-icons';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import CategoryLabel from '../../PresentationalComponents/Labels/CategoryLabel';
import { useIntl } from 'react-intl';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
  topicLinks,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import messages from '../../Messages';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { ruleResolutionRisk, enableRule } from './helpers';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core/deprecated';

import './Details.scss';

export const DetailsRules = ({
  rule,
  topics,
  permsDisableRec,
  setActionsDropdownOpen,
  actionsDropdownOpen,
  addNotification,
  handleModalToggle,
  refetch,
}) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      <PageHeader className="adv-c-page__header">
        <Breadcrumbs ouiaId="override" current={rule.description || ''} />
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section pf-m-light pf-v5-u-pt-sm">
        <RuleDetails
          messages={formatMessages(
            intl,
            RuleDetailsMessagesKeys,
            mapContentToValues(intl, rule)
          )}
          product={AdvisorProduct.rhel}
          rule={rule}
          Topics={
            topics &&
            rule.tags &&
            topicLinks(rule, topics, Link).length > 0 && (
              <>
                <strong>
                  {intl.formatMessage(messages.topicRelatedToRule)}
                </strong>
                <br />
                {topicLinks(rule, topics, Link)}
              </>
            )
          }
          resolutionRisk={ruleResolutionRisk(rule)}
          resolutionRiskDesc={RISK_OF_CHANGE_DESC[ruleResolutionRisk(rule)]}
          isDetailsPage
          header={
            <React.Fragment>
              <PageHeaderTitle
                title={
                  <React.Fragment>
                    {rule.description} <RuleLabels rule={rule} />
                  </React.Fragment>
                }
              />
              <p>
                <span className="pf-v5-u-mr-md">
                  {intl.formatMessage(messages.rulesDetailsModifieddate, {
                    date: (
                      <DateFormat
                        date={new Date(rule.publish_date)}
                        type="onlyDate"
                      />
                    ),
                  })}
                </span>
                <CategoryLabel labelList={[rule.category]} />
              </p>
            </React.Fragment>
          }
          onVoteClick={async (ruleId, calculatedRating) => {
            await Post(
              `${BASE_URL}/rating/`,
              {},
              { rule: ruleId, rating: calculatedRating }
            );
          }}
          knowledgebaseUrl={
            rule.node_id ? `https://access.redhat.com/node/${rule.node_id}` : ''
          }
          ViewAffectedLink={Link}
        >
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <Tooltip
                trigger={!permsDisableRec ? 'mouseenter' : ''}
                content={intl.formatMessage(messages.permsAction)}
              >
                <Dropdown
                  className="adv-c-dropdown-details-actions"
                  onSelect={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                  position="right"
                  ouiaId="actions"
                  toggle={
                    <DropdownToggle
                      isDisabled={!permsDisableRec}
                      onToggle={(_event, actionsDropdownOpen) =>
                        setActionsDropdownOpen(actionsDropdownOpen)
                      }
                      toggleIndicator={CaretDownIcon}
                    >
                      {intl.formatMessage(messages.actions)}
                    </DropdownToggle>
                  }
                  isOpen={actionsDropdownOpen}
                  dropdownItems={
                    rule && rule.rule_status === 'enabled'
                      ? [
                          <DropdownItem
                            key="link"
                            ouiaId="disable"
                            onClick={() => {
                              handleModalToggle(true);
                            }}
                          >
                            {intl.formatMessage(messages.disableRule)}
                          </DropdownItem>,
                        ]
                      : [
                          <DropdownItem
                            key="link"
                            ouiaId="enable"
                            onClick={() => {
                              enableRule(
                                rule,
                                refetch,
                                intl,
                                addNotification,
                                handleModalToggle
                              );
                            }}
                          >
                            {intl.formatMessage(messages.enableRule)}
                          </DropdownItem>,
                        ]
                  }
                />
              </Tooltip>
            </FlexItem>
          </Flex>
        </RuleDetails>
      </section>
    </React.Fragment>
  );
};
