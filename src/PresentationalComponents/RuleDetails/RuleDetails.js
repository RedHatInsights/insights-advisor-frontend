/* eslint max-len: 0 */
import './_RuleDetails.scss';

import * as AppConstants from '../../AppConstants';

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
  TextVariants,
} from '@patternfly/react-core/dist/js/components/Text/Text';
import { compact, intersection } from 'lodash';

import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import PowerOffIcon from '@patternfly/react-icons/dist/js/icons/power-off-icon';
import PropTypes from 'prop-types';
import React from 'react';
import RuleRating from '../RuleRating/RuleRating';
import { SeverityLine } from '@redhat-cloud-services/frontend-components-charts/esm/SeverityLine';
import { TextContent } from '@patternfly/react-core/dist/js/components/Text/TextContent';
import barDividedList from '../../Utilities/BarDividedList';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { strong } from '../../Utilities/intlHelper';

const RuleDetails = ({
  children,
  rule,
  resolutionRisk,
  intl,
  topics,
  header,
  isDetailsPage,
}) => {
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
            {isDetailsPage
              ? ruleDescription(rule.generic, true)
              : ruleDescription(rule.summary)}
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
          {isDetailsPage && <RuleRating rule={rule} />}
          {!isDetailsPage && rule.impacted_systems_count > 0 && (
            <StackItem>
              <Link
                key={`${rule.rule_id}-link`}
                to={`/recommendations/${rule.rule_id}`}
              >
                {intl.formatMessage(messages.viewAffectedSystems, {
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
            <Stack className="ins-c-rule-details__stack">
              <StackItem>
                <strong>{intl.formatMessage(messages.totalRisk)}</strong>
              </StackItem>
              <StackItem className="pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm">
                <span className="ins-c-rule-details__stackitem">
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
              <hr></hr>
              <StackItem>
                <strong>{intl.formatMessage(messages.riskofchange)}</strong>
              </StackItem>
              <StackItem
                className={`pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm`}
              >
                <span className="ins-c-rule-details__stackitem">
                  <span>
                    <InsightsLabel
                      text={AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk]}
                      value={resolutionRisk}
                      hideIcon
                    />
                  </span>
                  <Stack hasGutter className="description-stack-override">
                    <StackItem>
                      <TextContent>
                        <Text component={TextVariants.p}>
                          {resolutionRisk
                            ? AppConstants.RISK_OF_CHANGE_DESC[resolutionRisk]
                            : intl.formatMessage(messages.undefined)}
                        </Text>
                      </TextContent>
                    </StackItem>
                    <StackItem>
                      <span className="system-reboot-message">
                        <PowerOffIcon
                          className={
                            rule.reboot_required
                              ? 'reboot-required-icon'
                              : 'no-reboot-required-icon'
                          }
                        />
                        <TextContent className="system-reboot-message__content">
                          <Text component={TextVariants.p}>
                            {intl.formatMessage(messages.systemReboot, {
                              strong: (str) => strong(str),
                              status: rule.reboot_required
                                ? intl.formatMessage(messages.is)
                                : intl.formatMessage(messages.isNot),
                            })}
                          </Text>
                        </TextContent>
                      </span>
                    </StackItem>
                  </Stack>
                </span>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
      </SplitItem>
    </Split>
  );
};

RuleDetails.propTypes = {
  children: PropTypes.any,
  rule: PropTypes.object,
  resolutionRisk: PropTypes.number,
  intl: PropTypes.any,
  topics: PropTypes.array,
  header: PropTypes.any,
  isDetailsPage: PropTypes.bool,
};

export default injectIntl(RuleDetails);
