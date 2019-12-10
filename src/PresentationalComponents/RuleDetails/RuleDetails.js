/* eslint max-len: 0 */
import './_RuleDetails.scss';

import * as AppConstants from '../../AppConstants';

import { Battery, Reboot, Shield } from '@redhat-cloud-services/frontend-components';
import { Card, CardBody, Split, SplitItem, Stack, StackItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { compact, intersection } from 'lodash';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import RuleRating from '../RuleRating//RuleRating';
import barDividedList from '../../Utilities/BarDividedList';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const RuleDetails = ({ children, rule, intl, topics, header, isDetailsPage }) => {
    const ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    const resolutionRisk = ruleResolutionRisk(rule);

    const topicLinks = () => topics && compact(topics.map((topic) =>
        intersection(topic.tag.split(' '), rule.tags.split(' ')).length &&
        <React.Fragment key={topic.slug}>
            <Link to={`/topics/${topic.slug}`}>
                {`${topic.name}`}
            </Link>
        </React.Fragment>
    ));

    return <Split gutter='sm'>
        <SplitItem>
            <Stack>
                {header && <StackItem>
                    {header}
                </StackItem>}
                <StackItem>
                    {
                        typeof rule.summary === 'string' &&
                        Boolean(rule.summary) &&
                        <ReactMarkdown source={rule.summary} escapeHtml={false} />
                    }
                </StackItem>
                {rule.node_id && (
                    <StackItem>
                        <a rel="noopener noreferrer" target="_blank" href={`https://access.redhat.com/node/${rule.node_id}`}>
                            {intl.formatMessage(messages.knowledgebaseArticle)}&nbsp;<ExternalLinkAltIcon size='sm' />
                        </a>
                    </StackItem>
                )}
                {topics && rule.tags && topicLinks().length > 0 &&
                    <StackItem>
                        <Card className="topicsCard" isCompact>
                            <CardBody>
                                <strong>{intl.formatMessage(messages.topicRelatedToRule)}</strong>
                                <br />
                                {barDividedList(topicLinks())}
                            </CardBody>
                        </Card>
                    </StackItem>
                }
                {isDetailsPage && <RuleRating rule={rule} />}
                {!isDetailsPage && rule.impacted_systems_count > 0 &&
                    <StackItem>
                        <Link key={`${rule.rule_id}-link`} to={`/rules/${rule.rule_id}`}>
                            {intl.formatMessage(messages.viewAffectedSystems, { systems: rule.impacted_systems_count })}
                        </Link>
                    </StackItem>
                }
            </Stack>
        </SplitItem>
        <SplitItem>
            <Stack gutter='sm'>
                {children && (
                    <StackItem>
                        {children}
                    </StackItem>
                )}
                <StackItem>
                    <Stack>
                        <StackItem>{intl.formatMessage(messages.totalRisk)}</StackItem>
                        <StackItem className='pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm'>
                            <span className='pf-u-display-inline-flex'>
                                <Battery
                                    label=''
                                    severity={rule.total_risk} />
                                <span className={`batteryTextMarginOverride pf-u-pl-sm ins-sev-clr-${rule.total_risk}`}>
                                    {AppConstants.TOTAL_RISK_LABEL[rule.total_risk] || intl.formatMessage(messages.undefined)}
                                </span>
                            </span>
                        </StackItem>
                        <StackItem>
                            <TextContent>
                                <Text component={TextVariants.small}>{intl.formatMessage(messages.rulesDetailsTotalriskBody, {
                                    likelihood: AppConstants.LIKELIHOOD_LABEL[rule.likelihood] || intl.formatMessage(messages.undefined),
                                    impact: AppConstants.IMPACT_LABEL[rule.impact.impact] || intl.formatMessage(messages.undefined),
                                    strong(str) { return <strong>{str}</strong>; }
                                })}</Text>
                            </TextContent>
                        </StackItem>
                        <hr></hr>
                        <StackItem>{intl.formatMessage(messages.riskofchange)}</StackItem>
                        <StackItem className='pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm'>
                            <span className='pf-u-display-inline-flex'>
                                <Shield
                                    hasTooltip={false}
                                    impact={resolutionRisk}
                                    size={'md'}
                                    title={AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)} />
                                <span className={`label pf-u-pl-sm ins-sev-clr-${resolutionRisk}`}>
                                    {AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)}
                                </span>
                            </span>
                        </StackItem>
                        <StackItem>
                            <TextContent>
                                <Text component={TextVariants.small}>
                                    {AppConstants.RISK_OF_CHANGE_DESC[resolutionRisk]}
                                </Text>
                            </TextContent>
                        </StackItem>
                    </Stack>
                    {rule.reboot_required && <Reboot red />}
                </StackItem>
            </Stack>
        </SplitItem>
    </Split>;
};

RuleDetails.propTypes = {
    children: PropTypes.any,
    rule: PropTypes.object,
    intl: PropTypes.any,
    topics: PropTypes.array,
    header: PropTypes.any,
    isDetailsPage: PropTypes.bool
};

export default injectIntl(RuleDetails);
