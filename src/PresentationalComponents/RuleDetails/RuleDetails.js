/* eslint max-len: 0 */
import React, { Component } from 'react';
import { Battery, Reboot, Shield } from '@redhat-cloud-services/frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import ReactMarkdown from 'react-markdown/with-html';

import * as AppConstants from '../../AppConstants';
import './_RuleDetails.scss';

class RuleDetails extends Component {

    ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    render () {
        const { children, className, rule } = this.props;
        const resolutionRisk = this.ruleResolutionRisk(rule);
        return (
            <Grid gutter='md' className={ className }>
                <GridItem md={ 8 } sm={ 12 }>
                    <Grid>
                        <GridItem className='pf-u-pb-md'>
                            {
                                typeof rule.summary === 'string' &&
                                Boolean(rule.summary) &&
                                <ReactMarkdown source={ rule.summary } escapeHtml={ false }/>
                            }
                        </GridItem>
                        { rule.node_id && (
                            <GridItem className='pf-u-pb-md'>
                                <a rel="noopener noreferrer" target="_blank" href={ `https://access.redhat.com/node/${rule.node_id}` }>
                                    Knowledgebase Article <ExternalLinkAltIcon size='sm'/>
                                </a>
                            </GridItem>
                        ) }
                    </Grid>
                </GridItem>
                <GridItem md={ 4 } sm={ 12 }>
                    <Grid gutter='sm'>
                        { children && (
                            <GridItem>
                                { children }
                            </GridItem>
                        ) }
                        <GridItem className='pf-u-pb-md' sm={ 8 } md={ 12 }>
                            <div>Total Risk</div>
                            <div className='pf-u-display-inline-flex pf-m-align-center pf-u-pb-sm pf-u-pt-sm'>
                                <div className='pf-u-display-inline-flex'>
                                    <Battery
                                        label=''
                                        severity={ rule.total_risk }
                                    />
                                </div>
                                <div className='pf-u-display-inline-flex'>
                                    <span className={ `label pf-u-pl-sm ins-sev-clr-${rule.total_risk}` }>
                                        { AppConstants.TOTAL_RISK_LABEL[rule.total_risk] || 'Undefined' }
                                    </span>
                                </div>
                            </div>
                            <p>
                                The <strong>likelihood</strong> that this will be a problem is
                                { ` ${AppConstants.LIKELIHOOD_LABEL[rule.likelihood] || 'Undefined'}. ` }
                                The <strong>impact</strong> of the problem would be
                                { ` ${AppConstants.IMPACT_LABEL[rule.impact.impact] || 'Undefined'} if it occurred.` }
                            </p>
                        </GridItem>
                        <GridItem sm={ 4 } md={ 12 }>
                            <div>Risk of Change</div>
                            <div className='pf-u-display-inline-flex pf-m-align-center pf-u-pb-sm pf-u-pt-sm'>
                                <div className='pf-u-display-inline-flex'>
                                    <Shield
                                        hasTooltip={ false }
                                        impact={ resolutionRisk }
                                        size={ 'md' }
                                        title={ AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || 'Undefined' }
                                    />
                                </div>
                                <div className='pf-u-display-inline-flex'>
                                    <span className={ `label pf-u-pl-sm ins-sev-clr-${resolutionRisk}` }>
                                        { AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || 'Undefined' }
                                    </span>
                                </div>
                            </div>
                            <p>{ AppConstants.RISK_OF_CHANGE_DESC[resolutionRisk] }</p>
                        </GridItem>
                        { rule.reboot_required && <Reboot red/> }
                    </Grid>
                </GridItem>
            </Grid>
        );
    }
}

RuleDetails.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    rule: PropTypes.object
};

export default connect(
    null,
    null
)(RuleDetails);
