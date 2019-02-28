import React, { Component } from 'react';
import { Ansible, Battery, Shield, routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import ReactMarkdown from 'react-markdown/with-html';
import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES, RISK_OF_CHANGE_LABEL, RISK_OF_CHANGE_DESC, TOTAL_RISK_LABEL, TOTAL_RISK_DESC } from '../../AppConstants';
import Loading from '../../PresentationalComponents/Loading/Loading';
import API from '../../Utilities/Api';

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

    render () {
        const { children, ruleFetchStatus, rule } = this.props;
        const { kbaDetails } = this.state;
        return (
            <>
                { ruleFetchStatus === 'pending' && (<Loading/>) }
                { ruleFetchStatus === 'fulfilled' && (
                    <Grid gutter='md'>
                        <GridItem md={ 8 } sm={ 12 }>
                            <Grid>
                                <GridItem className='actions__description'>
                                    {
                                        typeof rule.summary === 'string' &&
                                        Boolean(rule.summary) &&
                                        <ReactMarkdown source={ rule.summary } escapeHtml={ false }/>
                                    }
                                </GridItem>
                                { kbaDetails.view_uri && (
                                    <GridItem>
                                        <a href={ kbaDetails.view_uri }>
                                            Knowledgebase Article
                                        </a>
                                    </GridItem>
                                ) }
                                <GridItem>Published: { `${(new Date(rule.publish_date)).toLocaleDateString()}` }</GridItem>
                                <GridItem>Tags: { `${rule.tags || 'Not available'}` }</GridItem>
                            </Grid>
                        </GridItem>
                        <GridItem md={ 4 } sm={ 12 }>
                            <Grid gutter='sm' className='actions__detail'>
                                <GridItem sm={ 8 } md={ 12 }>
                                    <Grid className='ins-l-icon-group__vertical' sm={ 4 } md={ 12 }>
                                        <div>Total Risk</div>
                                        <GridItem><Battery label={ TOTAL_RISK_LABEL[rule.total_risk] } severity={ rule.total_risk }/></GridItem>
                                        <div>{ TOTAL_RISK_DESC[rule.total_risk] }</div>
                                    </Grid>
                                </GridItem>
                                <GridItem sm={ 4 } md={ 12 }>
                                    <div>Risk of Change</div>
                                    <Shield
                                        hasTooltip={ false }
                                        impact={ RISK_OF_CHANGE_LABEL[rule.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk] }
                                        size={ 'md' }
                                        title={ RISK_OF_CHANGE_LABEL[rule.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk] }
                                    />
                                    <div>{ RISK_OF_CHANGE_DESC[rule.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk] }</div>
                                </GridItem>
                                { (
                                    <GridItem>
                                        { children }
                                    </GridItem>
                                ) }
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
    entities: PropTypes.any,
    fetchRule: PropTypes.func,
    fetchSystem: PropTypes.func,
    match: PropTypes.any,
    rule: PropTypes.object,
    ruleFetchStatus: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
    entities: state.entities,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(RuleDetails));
