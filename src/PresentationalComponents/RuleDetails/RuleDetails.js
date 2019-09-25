/* eslint max-len: 0 */
import React from 'react';
import { Battery, Reboot, Shield } from '@redhat-cloud-services/frontend-components';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import ReactMarkdown from 'react-markdown/with-html';
import { injectIntl } from 'react-intl';

import * as AppConstants from '../../AppConstants';
import './_RuleDetails.scss';
import messages from '../../Messages';

const RuleDetails = ({ children, className, rule, intl }) => {
    const ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    const resolutionRisk = ruleResolutionRisk(rule);

    return <Grid gutter='md' className={className}>
        <GridItem md={8} sm={12}>
            <Grid>
                <GridItem className='pf-u-pb-md'>
                    {
                        typeof rule.summary === 'string' &&
                        Boolean(rule.summary) &&
                        <ReactMarkdown source={rule.summary} escapeHtml={false} />
                    }
                </GridItem>
                {rule.node_id && (
                    <GridItem className='pf-u-pb-md'>
                        <a rel="noopener noreferrer" target="_blank" href={`https://access.redhat.com/node/${rule.node_id}`}>
                            {intl.formatMessage(messages.knowledgebaseArticle)}&nbsp;<ExternalLinkAltIcon size='sm' />
                        </a>
                    </GridItem>
                )}
            </Grid>
        </GridItem>
        <GridItem md={4} sm={12}>
            <Grid gutter='sm'>
                {children && (
                    <GridItem>
                        {children}
                    </GridItem>
                )}
                <GridItem className='pf-u-pb-md' sm={8} md={12}>
                    <div>{intl.formatMessage(messages.rulesTableColumnTitleTotalrisk)}</div>
                    <div className='pf-u-display-inline-flex pf-m-align-center pf-u-pb-sm pf-u-pt-sm'>
                        <div className='pf-u-display-inline-flex'>
                            <Battery
                                label=''
                                severity={rule.total_risk}
                            />
                        </div>
                        <div className='pf-u-display-inline-flex'>
                            <span className={`label pf-u-pl-sm ins-sev-clr-${rule.total_risk}`}>
                                {AppConstants.TOTAL_RISK_LABEL[rule.total_risk] || intl.formatMessage(messages.undefined)}
                            </span>
                        </div>
                    </div>
                    <p>{intl.formatMessage(messages.rulesDetailsTotalriskBody, {
                        likelihood: AppConstants.LIKELIHOOD_LABEL[rule.likelihood] || intl.formatMessage(messages.undefined),
                        impact: (rule.impact && AppConstants.IMPACT_LABEL[rule.impact.impact]) || intl.formatMessage(messages.undefined),
                        strong(str) { return <strong key={str}>{str}</strong>; }
                    })}</p>
                </GridItem>
                <GridItem sm={4} md={12}>
                    <div>{intl.formatMessage(messages.riskofchange)}</div>
                    <div className='pf-u-display-inline-flex pf-m-align-center pf-u-pb-sm pf-u-pt-sm'>
                        <div className='pf-u-display-inline-flex'>
                            <Shield
                                hasTooltip={false}
                                impact={resolutionRisk}
                                size={'md'}
                                title={AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)}
                            />
                        </div>
                        <div className='pf-u-display-inline-flex'>
                            <span className={`label pf-u-pl-sm ins-sev-clr-${resolutionRisk}`}>
                                {AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)}
                            </span>
                        </div>
                    </div>
                    <p>{AppConstants.RISK_OF_CHANGE_DESC[resolutionRisk]}</p>
                </GridItem>
                {rule.reboot_required && <Reboot red />}
            </Grid>
        </GridItem>
    </Grid>;
};

RuleDetails.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    rule: PropTypes.object,
    intl: PropTypes.any
};

export default injectIntl(RuleDetails);
