/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Ansible, Battery, Main, PageHeader, PageHeaderTitle, RemediationButton, routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import Breadcrumbs, { buildBreadcrumbs } from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import ReactMarkdown from 'react-markdown/with-html';

import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES } from '../../AppConstants';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import './_actions.scss';
import API from '../../Utilities/Api';

class ListActions extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false
    };

    componentDidMount () {
        this.props.fetchRule({ rule_id: this.props.match.params.id });
        this.props.fetchSystem({ rule_id: this.props.match.params.id });
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

    onRemediationCreated = result => {
        this.props.addNotification(result.getNotification());
    }

    render () {
        const { breadcrumbs, ruleFetchStatus, rule, systemFetchStatus, system } = this.props;
        const { kbaDetails } = this.state;
        return (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumbs
                        current={ rule.description || '' }
                        items={ buildBreadcrumbs(this.props.match, { breadcrumbs }) }
                    />
                    <PageHeaderTitle title={ rule.description || '' }/>
                </PageHeader>
                <Main className='actions__list'>
                    <React.Fragment>
                        { ruleFetchStatus === 'fulfilled' && (
                            <Stack gutter='md'>
                                <StackItem>
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
                                                <GridItem sm={ 12 } md={ 12 }> <Ansible unsupported={ !rule.has_playbook }/> </GridItem>
                                                <GridItem sm={ 8 } md={ 12 }>
                                                    <Grid className='ins-l-icon-group__vertical' sm={ 4 } md={ 12 }>
                                                        <GridItem> <Battery label='Impact' severity={ rule.impact.impact }/> </GridItem>
                                                        <GridItem> <Battery label='Likelihood' severity={ rule.likelihood }/> </GridItem>
                                                        <GridItem> <Battery label='Total Risk' severity={ rule.severity }/> </GridItem>
                                                    </Grid>
                                                </GridItem>
                                                <GridItem sm={ 4 } md={ 12 }>
                                                    <Battery
                                                        label='Risk Of Change'
                                                        severity={ rule.resolution_set.find(resolution =>
                                                            resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk
                                                        }
                                                    />
                                                </GridItem>
                                                { rule.has_playbook && (
                                                    <GridItem>
                                                        <RemediationButton
                                                            isDisabled={ this.getSelectedItems().length === 0 }
                                                            dataProvider={ this.remediationDataProvider }
                                                            onRemediationCreated={ this.onRemediationCreated }
                                                        />
                                                    </GridItem>)
                                                }
                                            </Grid>
                                        </GridItem>
                                    </Grid>
                                </StackItem>
                                <StackItem>
                                    <Card>
                                        <CardHeader>
                                            <strong>Affected Hosts</strong>
                                        </CardHeader>
                                        <CardBody>
                                            { systemFetchStatus === 'fulfilled' && (

                                                <Inventory items={ system.host_ids }/>
                                            ) }
                                            { systemFetchStatus === 'pending' && (<Loading/>) }
                                        </CardBody>
                                    </Card>
                                </StackItem>
                            </Stack>
                        ) }
                        { ruleFetchStatus === 'pending' && (<Loading/>) }
                        { ruleFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` }/>) }
                    </React.Fragment>
                </Main>
            </React.Fragment>
        );
    }
}

ListActions.propTypes = {
    breadcrumbs: PropTypes.array,
    match: PropTypes.any,
    fetchRule: PropTypes.func,
    ruleFetchStatus: PropTypes.string,
    rule: PropTypes.object,
    fetchSystem: PropTypes.func,
    systemFetchStatus: PropTypes.string,
    system: PropTypes.object,
    entities: PropTypes.any,
    addNotification: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    system: state.AdvisorStore.system,
    systemFetchStatus: state.AdvisorStore.systemFetchStatus,
    entities: state.entities,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListActions));
