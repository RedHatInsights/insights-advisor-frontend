/* eslint camelcase: 0 */
import React, { Component } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { Main, PageHeader, PageHeaderTitle, BulkSelect } from '@redhat-cloud-services/frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Title, ToolbarItem, ToolbarGroup } from '@patternfly/react-core';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { injectIntl } from 'react-intl';
import { AnsibeTowerIcon } from '@patternfly/react-icons';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';
import messages from '../../Messages';

import './Details.scss';

class OverviewDetails extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false,
        selected: false,
        selectedEntities: 0
    };

    async componentDidMount() {
        this.props.fetchRule({ rule_id: this.props.match.params.id });
        this.props.fetchSystem({ rule_id: this.props.match.params.id });
        this.props.fetchTopics();
        this.setState({ selectedEntities: this.getSelectedItems().length });
    }
    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this.setState({ selectedEntities: this.getSelectedItems().length });
        }
    }

    getSelectedItems = () => {
        const { entities, system } = this.props;
        if (!entities || !entities.loaded) {
            return [];
        }

        return this.state.selectedEntities === system.host_ids.length ?
            system.host_ids
            : entities.rows.filter(entity => entity.selected).map(entity => entity.id);
    };

    remediationDataProvider = () => {
        return {
            issues: [{
                id: `advisor:${this.props.rule.rule_id}`,
                description: this.props.rule.description
            }],
            systems: this.getSelectedItems()
        };
    };

    onRemediationCreated = result => {
        this.props.addNotification(result.getNotification());
    };

    bulkOnClick = (selected, selectedEntities) => {
        this.setState({ selected, selectedEntities });
        this.props.selectEntity({ selected });
    }

    render() {
        const { match, ruleFetchStatus, rule, systemFetchStatus, system, intl, entities, topics } = this.props;
        const { selected, selectedEntities } = this.state;
        const bulkSelectMenuItems = [{
            title: intl.formatMessage(messages.selectNone),
            onClick: () => this.bulkOnClick(false, 0)
        },
        {
            title: intl.formatMessage(messages.selectPage, { items: entities && entities.count || 0 }),
            onClick: () => this.bulkOnClick(true, entities && entities.count || 0)
        },
        {
            title: intl.formatMessage(messages.selectAll, { items: system && system.host_ids && system.host_ids.length || 0 }),
            onClick: () => this.bulkOnClick(true, system && system.host_ids && system.host_ids.length || 0)
        }];

        return (
            <React.Fragment>
                {ruleFetchStatus === 'fulfilled' && (
                    <React.Fragment>
                        <PageHeader>
                            <Breadcrumbs
                                current={rule.description || ''}
                                match={match}
                            />
                            <PageHeaderTitle title={rule.description || ''} />
                            <p>{intl.formatMessage(messages.rulesDetailsPubishdate, { date: (new Date(rule.publish_date)).toLocaleDateString() })}</p>
                        </PageHeader>
                        <Main className='pf-m-light pf-u-pt-sm'>
                            <RuleDetails rule={rule} topics={topics} />
                        </Main>
                    </React.Fragment>
                )}
                {ruleFetchStatus === 'pending' && (<Loading />)}
                <Main>
                    <React.Fragment>
                        {ruleFetchStatus === 'fulfilled' && (
                            <React.Fragment>
                                <Title headingLevel="h3" size="2xl" className='titlePaddingOverride'>
                                    {intl.formatMessage(messages.affectedSystems)}
                                </Title>
                                {systemFetchStatus === 'fulfilled' && (
                                    <Inventory tableProps={{ canSelectAll: false }} items={system.host_ids}>
                                        {rule.playbook_count > 0 &&
                                            <ToolbarGroup>
                                                <ToolbarItem className='pf-u-mr-sm'>
                                                    <BulkSelect count={selectedEntities}
                                                        items={bulkSelectMenuItems}
                                                        checked={selected} />
                                                </ToolbarItem>
                                                <ToolbarItem>
                                                    <RemediationButton
                                                        isDisabled={selectedEntities === 0}
                                                        dataProvider={this.remediationDataProvider}
                                                        onRemediationCreated={this.onRemediationCreated}
                                                    >
                                                        <AnsibeTowerIcon size='sm' color={global_BackgroundColor_100.value} />
                                                        &nbsp;{intl.formatMessage(messages.remediate)}
                                                    </RemediationButton>
                                                </ToolbarItem>
                                            </ToolbarGroup>
                                        }
                                    </Inventory>
                                )}
                                {systemFetchStatus === 'pending' && (<Loading />)}
                            </React.Fragment>
                        )}
                        {ruleFetchStatus === 'pending' && (<Loading />)}
                        {ruleFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.rulesTableFetchRulesError)} />)}
                    </React.Fragment>
                </Main>
            </React.Fragment>
        );
    }
}

OverviewDetails.propTypes = {
    match: PropTypes.any,
    fetchRule: PropTypes.func,
    ruleFetchStatus: PropTypes.string,
    rule: PropTypes.object,
    fetchSystem: PropTypes.func,
    systemFetchStatus: PropTypes.string,
    system: PropTypes.object,
    entities: PropTypes.any,
    addNotification: PropTypes.func.isRequired,
    intl: PropTypes.any,
    selectEntity: PropTypes.func,
    fetchTopics: PropTypes.func,
    topics: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    system: state.AdvisorStore.system,
    systemFetchStatus: state.AdvisorStore.systemFetchStatus,
    entities: state.entities,
    topics: state.AdvisorStore.topics,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url)),
    addNotification: data => dispatch(addNotification(data)),
    selectEntity: (payload) => dispatch({ type: 'SELECT_ENTITY', payload }),
    fetchTopics: () => dispatch(AppActions.fetchTopics())
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDetails)));
