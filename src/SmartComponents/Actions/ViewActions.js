/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Main, PageHeader, PageHeaderTitle, RemediationButton, routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader } from '@patternfly/react-core';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import RuleDetails from '../../PresentationalComponents/RuleDetails/RuleDetails';

class ListActions extends Component {
    state = {
        kbaDetails: {},
        kbaDetailsLoading: false
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.fetchRule({ rule_id: this.props.match.params.id });
        this.props.fetchSystem({ rule_id: this.props.match.params.id });
    }

    getSelectedItems = () => {
        if (!this.props.entities || !this.props.entities.loaded) {
            return [];
        }

        return this.props.entities.rows.filter(entity => entity.selected).map(entity => entity.id);
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

    render () {
        const { match, ruleFetchStatus, rule, systemFetchStatus, system } = this.props;
        return (
            <React.Fragment>
                { ruleFetchStatus === 'fulfilled' && (
                    <>
                        <PageHeader>
                            <Breadcrumbs
                                current={ rule.description || '' }
                                match={ match }
                            />
                            <PageHeaderTitle title={ rule.description || '' }/>
                            <p>Publish Date: { `${(new Date(rule.publish_date)).toLocaleDateString()}` }</p>
                        </PageHeader>
                        <Main className='pf-m-light pf-u-pt-sm'>
                            <RuleDetails rule={ rule }>
                                { rule.playbook_count && (
                                    <RemediationButton
                                        isDisabled={ this.getSelectedItems().length === 0 }
                                        dataProvider={ this.remediationDataProvider }
                                        onRemediationCreated={ this.onRemediationCreated }
                                    />
                                ) }
                            </RuleDetails>
                        </Main>
                    </>
                ) }
                { ruleFetchStatus === 'pending' && (<Loading/>) }
                <Main>
                    <React.Fragment>
                        { ruleFetchStatus === 'fulfilled' && (
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
