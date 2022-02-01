/* eslint-disable react/prop-types */
/* eslint max-len: 0 */
import './_RuleDetails.scss';

import * as AppConstants from '../../AppConstants';

import { IntlProvider, useIntl } from 'react-intl';
import {
  Split,
  SplitItem,
} from '@patternfly/react-core/dist/js/layouts/Split/index';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/js/layouts/Stack/index';
import {
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core/dist/js/components/Text/index';
import { compact, intersection } from 'lodash';

import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Link, Router } from 'react-router-dom';
import Markdown from 'react-markdown';
import PropTypes from 'prop-types';
import React from 'react';
import { RebootRequired } from '../Common/Common';
import RuleRating from '../RuleRating/RuleRating';
import { SeverityLine } from '@redhat-cloud-services/frontend-components-charts/esm/SeverityLine';
import barDividedList from '../../Utilities/BarDividedList';
import messages from '../../Messages';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { strong } from '../../Utilities/intlHelper';

const BaseRuleDetails = ({
  children,
  rule,
  resolutionRisk,
  topics,
  header,
  isDetailsPage,
  onFeedbackChanged,
  isOpenShift,
  riskOfChangeDesc,
  messageDescriptors,
}) => {
  const intl = useIntl();
  const topicLinks = () =>
    topics &&
    compact(
      topics.map(
        (topic) =>
          intersection(topic.tag.split(' '), rule.tags.split(' ')).length && (
            <React.Fragment key={topic.slug}>
              <Link to={`/topics/${topic.slug}`}>{`${topic.name}`}</Link>
            </React.Fragment>
          )
      )
    );

  const ruleDescription = (data, isGeneric) =>
    typeof data === 'string' &&
    Boolean(data) && (
      <span className={isGeneric && 'genericOverride'}>
        <Markdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>{data}</Markdown>
      </span>
    );

  return (
    <Split className="ins-c-rule-details__split" hasGutter>
      <SplitItem>
        <Stack hasGutter>
          {header && <StackItem>{header}</StackItem>}
          <StackItem>
            {isOpenShift && ruleDescription(rule.generic, true)}
            {!isOpenShift &&
              (isDetailsPage
                ? ruleDescription(rule.generic, true)
                : ruleDescription(rule.summary))}
          </StackItem>
          {rule.node_id && (
            <StackItem>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`https://access.redhat.com/node/${rule.node_id}`}
              >
                {intl.formatMessage(messages.knowledgebaseArticle)}&nbsp;
                <ExternalLinkAltIcon size="sm" />
              </a>
            </StackItem>
          )}
          {topics && rule.tags && topicLinks().length > 0 && (
            <StackItem>
              <strong>{intl.formatMessage(messages.topicRelatedToRule)}</strong>
              <br />
              {barDividedList(topicLinks())}
            </StackItem>
          )}
          {isDetailsPage && onFeedbackChanged && (
            <RuleRating
              ruleId={rule.rule_id}
              ruleRating={rule.rating}
              updateRatingAction={onFeedbackChanged}
            />
          )}
          {!isDetailsPage &&
            rule?.[
              isOpenShift ? 'impacted_clusters_count' : 'impacted_systems_count'
            ] > 0 && (
              <StackItem>
                <Link
                  key={`${rule.rule_id}-link`}
                  to={`/recommendations/${rule.rule_id}`}
                >
                  {isOpenShift
                    ? intl.formatMessage(
                        messageDescriptors.viewAffectedClusters,
                        {
                          clusters: rule.impacted_clusters_count,
                        }
                      )
                    : intl.formatMessage(messages.viewAffectedSystems, {
                        systems: rule.impacted_systems_count,
                      })}
                </Link>
              </StackItem>
            )}
        </Stack>
      </SplitItem>
      <SplitItem>
        <Stack gutter="sm">
          {children && <StackItem>{children}</StackItem>}
          <StackItem>
            <Stack className="adv-l-stack-rule-details">
              <StackItem>
                <strong>{intl.formatMessage(messages.totalRisk)}</strong>
              </StackItem>
              <StackItem className="pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm">
                <span className="adv-l-stack-rule-details-item">
                  <span>
                    <InsightsLabel value={rule.total_risk} />
                  </span>
                  <Stack hasGutter className="description-stack-override">
                    <StackItem>
                      <TextContent>
                        <Text component={TextVariants.p}>
                          {intl.formatMessage(
                            messages.rulesDetailsTotalriskBody,
                            {
                              risk:
                                AppConstants.TOTAL_RISK_LABEL_LOWER[
                                  rule.total_risk
                                ] || intl.formatMessage(messages.undefined),
                              strong: (str) => strong(str),
                            }
                          )}
                        </Text>
                      </TextContent>
                    </StackItem>
                    <Stack>
                      <StackItem>
                        <SeverityLine
                          className="severity-line"
                          title={intl.formatMessage(messages.likelihoodLevel, {
                            level:
                              AppConstants.LIKELIHOOD_LABEL[rule.likelihood],
                          })}
                          value={rule.likelihood}
                          tooltipMessage={intl.formatMessage(
                            messages.likelihoodDescription,
                            {
                              level:
                                AppConstants.LIKELIHOOD_LABEL_LOWER[
                                  rule.likelihood
                                ],
                            }
                          )}
                        />
                      </StackItem>
                      <StackItem>
                        <SeverityLine
                          className="severity-line"
                          title={intl.formatMessage(messages.impactLevel, {
                            level:
                              AppConstants.IMPACT_LABEL[rule.impact.impact],
                          })}
                          value={rule.impact.impact}
                          tooltipMessage={intl.formatMessage(
                            messages.impactDescription,
                            {
                              level:
                                AppConstants.IMPACT_LABEL_LOWER[
                                  rule.impact.impact
                                ],
                            }
                          )}
                        />
                      </StackItem>
                    </Stack>
                  </Stack>
                </span>
              </StackItem>
              {resolutionRisk && riskOfChangeDesc && (
                <React.Fragment>
                  <hr></hr>
                  <StackItem>
                    <strong>{intl.formatMessage(messages.riskofchange)}</strong>
                  </StackItem>
                  <StackItem
                    className={`pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm`}
                  >
                    <span className="adv-l-stack-rule-detailsitem">
                      <span>
                        <InsightsLabel
                          text={
                            AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk]
                          }
                          value={resolutionRisk}
                          hideIcon
                        />
                      </span>
                      <Stack hasGutter className="description-stack-override">
                        <StackItem>
                          <TextContent>
                            <Text component={TextVariants.p}>
                              {resolutionRisk
                                ? riskOfChangeDesc
                                : intl.formatMessage(messages.undefined)}
                            </Text>
                          </TextContent>
                        </StackItem>
                        {!isOpenShift && (
                          <StackItem>
                            {RebootRequired(rule.reboot_required)}
                          </StackItem>
                        )}
                      </Stack>
                    </span>
                  </StackItem>
                </React.Fragment>
              )}
            </Stack>
          </StackItem>
        </Stack>
      </SplitItem>
    </Split>
  );
};

const RuleDetails = ({ intlProps, history, ...props }) => {
  const RouterWrapper = history ? Router : React.Fragment;
  const IntlWrapper = intlProps ? IntlProvider : React.Fragment;

  return (
    <RouterWrapper {...(history && { history })}>
      <IntlWrapper
        {...(intlProps && {
          locale: navigator.language.slice(0, 2),
          messages,
          onError: console.log,
          ...intlProps,
        })}
      >
        <BaseRuleDetails {...props} />
      </IntlWrapper>
    </RouterWrapper>
  );
};

RuleDetails.propTypes = {
  children: PropTypes.any.isRequired,
  rule: PropTypes.object.isRequired,
  topics: PropTypes.array,
  header: PropTypes.any.isRequired,
  isDetailsPage: PropTypes.bool.isRequired,
  resolutionRisk: PropTypes.number,
  riskOfChangeDesc: PropTypes.string,
  /**
   * onFeedbackChanged - a callback used to update the rating of a particular rule
   * @param {string} ruleId - ID (usually in plugin|error_key format) of the rule that needs to be updated
   * @param {number} newRating rating (-1, 0, 1)
   */
  onFeedbackChanged: PropTypes.func,
  /**
   * isOpenShift - true when `rule` contains an OCP rule
   */
  isOpenShift: PropTypes.bool.isRequired,
  /**
   * intlProps - if provided, it will be passed to IntlProvider custom wrapper
   */
  intlProps: PropTypes.object,
  /**
   * messageDescriptors - allows to use custom message descriptors
   */
  messageDescriptors: PropTypes.object,
  /**
   * history - if provided, it will be passed to Router custom wrapper
   */
  history: PropTypes.object,
};

export default RuleDetails;
