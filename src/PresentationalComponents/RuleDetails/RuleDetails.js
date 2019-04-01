/* eslint max-len: 0 */
import React, { Component } from 'react';
import { Battery, Shield, Reboot } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import ReactMarkdown from 'react-markdown/with-html';

import * as AppConstants from '../../AppConstants';
import API from '../../Utilities/Api';
import './_RuleDetails.scss';

class RuleDetails extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false
    };

    componentDidMount () {
        this.fetchKbaDetails();
    }

    async fetchKbaDetails () {
        if (this.props.rule.node_id) {
            try {
                this.setState({ kbaDetailsLoading: true });
                const kbaDetails = (await API.get(`https://access.redhat.com/rs/search?q=id:${this.props.rule.node_id}`,
                    { Accept: 'application/vnd.redhat.solr+json' })).data.response.docs[0];
                this.setState({ kbaDetails });
            } catch (error) {
                this.props.addNotification({
                    variant: 'danger',
                    dismissable: true,
                    title: '',
                    description: 'KBA fetch failed.'
                });
            }
        }
    }

    ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    render () {
        const { children, className, rule } = this.props;
        const { kbaDetails } = this.state;
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
                        { kbaDetails.view_uri && (
                            <GridItem className='pf-u-pb-md'>
                                <a href={ kbaDetails.view_uri }>
                                    Knowledgebase Article <ExternalLinkAltIcon size='sm'/>
                                </a>
                            </GridItem>
                        ) }
                        { rule.tags && (
                            <GridItem>
                                Find Other Rules Related To:<br/>
                                { rule.tags.replace(/ /g, ', ') }
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
                                { `The likelihood that this will be a problem is ${AppConstants.LIKELIHOOD_LABEL[rule.likelihood] || 'Undefined'}. ` }
                                { `The impact of the problem would be ${AppConstants.IMPACT_LABEL[rule.impact.impact] || 'Undefined'} if it occurred.` }
                            </p>
                        </GridItem>
                        <GridItem sm={ 4 } md={ 12 } className='pf-l-flex'>
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
    addNotification: PropTypes.func,
    children: PropTypes.any,
    className: PropTypes.string,
    rule: PropTypes.object
};

const mapDispatchToProps = dispatch => bindActionCreators({
    addNotification: data => addNotification(data)
}, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(RuleDetails);
