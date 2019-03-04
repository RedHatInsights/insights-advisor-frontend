/* eslint max-len: 0 */
import React, { Component } from 'react';
import { Battery, Shield, routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import ReactMarkdown from 'react-markdown/with-html';

import * as AppActions from '../../AppActions';
import * as AppConstants from '../../AppConstants';
import Loading from '../../PresentationalComponents/Loading/Loading';
import API from '../../Utilities/Api';
import './_RuleDetails.scss';

class RuleDetails extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false
    }

    componentDidUpdate () {
        if (this.props.ruleFetchStatus === 'fulfilled' && !this.state.kbaDetailsLoading) {
            this.setState({ kbaDetailsLoading: true });
            this.fetchKbaDetails();
        }
    }

    async fetchKbaDetails () {
        try {
            const kbaDetails = (await API.get(`/rs/search?q=id:${this.props.rule.node_id }`)).data.response.docs[0];
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

    getSelectedItems = () => {
        if (!this.props.entities || !this.props.entities.loaded) {
            return [];
        }

        return this.props.entities.rows.filter(entity => entity.selected).map(entity => entity.id);
    }

    remediationDataProvider = () => {
        return {
            issues: [{
                id: `advisor:${this.props.rule.rule_id}`,
                description: this.props.rule.description
            }],
            systems: this.getSelectedItems()
        };
    }

    ruleResolutionRisk = (rule) => {
        return (rule.resolution_set.find(resolution => resolution.system_type === AppConstants.SYSTEM_TYPES.rhel).resolution_risk.risk);
    };

    ruleRebootRequired = (rule) => {
        return rule.resolution_set.find(resolution => resolution.system_type === AppConstants.SYSTEM_TYPES.rhel).resolution_risk.reboot_required;
    };

    render () {
        const { children, className, ruleFetchStatus, rule } = this.props;
        const { kbaDetails } = this.state;
        return (
            <>
                { ruleFetchStatus === 'pending' && (<Loading/>) }
                { ruleFetchStatus === 'fulfilled' && (
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
                                            Knowledgebase Article
                                        </a>
                                    </GridItem>
                                ) }
                                { rule.tags && (
                                    <GridItem>
                                        Find Other Rules Related To:<br />
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
                                                impact={ this.ruleResolutionRisk(rule) }
                                                size={ 'md' }
                                                title={ AppConstants.RISK_OF_CHANGE_LABEL[this.ruleResolutionRisk(rule)] || 'Undefined' }
                                            />
                                        </div>
                                        <div className='pf-u-display-inline-flex'>
                                            <span className={ `label pf-u-pl-sm ins-sev-clr-${this.ruleResolutionRisk(rule)}` }>
                                                { AppConstants.RISK_OF_CHANGE_LABEL[this.ruleResolutionRisk(rule)] || 'Undefined' }
                                            </span>
                                        </div>
                                    </div>
                                    <p>{ AppConstants.RISK_OF_CHANGE_DESC[this.ruleResolutionRisk(rule)] }</p>
                                </GridItem>
                                { this.ruleRebootRequired && (<GridItem>
                                    <span className='ins-sev-clr-4'>Restart Required</span>
                                </GridItem>) }
                            </Grid>
                        </GridItem>
                    </Grid>
                ) }
            </>
        );
    }
}

RuleDetails.propTypes = {
    addNotification: PropTypes.func.isRequired,
    children: PropTypes.any,
    className: PropTypes.string,
    entities: PropTypes.any,
    fetchRule: PropTypes.func,
    fetchSystem: PropTypes.func,
    rule: PropTypes.object,
    ruleFetchStatus: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
    entities: state.entities,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    addNotification: data => addNotification(data),
    fetchSystem: (url) => AppActions.fetchSystem(url)
}, dispatch);

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(RuleDetails));
