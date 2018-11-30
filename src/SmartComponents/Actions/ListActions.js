/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Ansible, Battery, Breadcrumbs, Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { buildBreadcrumbs, onNavigate, parseBreadcrumbs } from '../../Helpers/breadcrumbs.js';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Inventory from '../../PresentationalComponents/Inventory/Inventory';
import './_actions.scss';

class ListActions extends Component {
    componentDidMount () {
        this.props.fetchRule({ rule_id: this.props.match.params.id });
        this.props.fetchSystem({ rule_id: this.props.match.params.id });
    }

    render () {
        const { breadcrumbs, ruleFetchStatus, rule, systemFetchStatus, system } = this.props;
        return (
            <React.Fragment>
                <Breadcrumbs
                    current={ rule.description || '' }
                    items={
                        breadcrumbs[0] !== undefined ?
                            parseBreadcrumbs(breadcrumbs, this.props.match.params, 2) :
                            buildBreadcrumbs(this.props.match, 2)
                    }
                    onNavigate={ onNavigate }
                />
                <PageHeader>
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
                                                <GridItem className='actions__description' dangerouslySetInnerHTML={ { __html: rule.summary_html } }/>
                                                { rule.node_id && (
                                                    <GridItem>
                                                        <a href={ `https://access.redhat.com/solutions/${rule.node_id}` }>
                                                        Knowledgebase Article
                                                        </a>
                                                    </GridItem>
                                                ) }
                                                <GridItem>Published: { `${(new Date(rule.publish_date)).toLocaleDateString()}` }</GridItem>
                                            </Grid>
                                        </GridItem>
                                        <GridItem md={ 4 } sm={ 12 }>
                                            <Grid gutter='sm' className='actions__detail'>
                                                <GridItem sm={ 12 } md={ 12 }> <Ansible unsupported={ rule.ansible }/> </GridItem>
                                                <GridItem sm={ 8 } md={ 12 }>
                                                    <Grid className='ins-l-icon-group__vertical' sm={ 4 } md={ 12 }>
                                                        <GridItem> <Battery label='Impact' severity={ rule.impact.impact }/> </GridItem>
                                                        <GridItem> <Battery label='Likelihood' severity={ rule.likelihood }/> </GridItem>
                                                        <GridItem> <Battery label='Total Risk' severity={ rule.severity }/> </GridItem>
                                                    </Grid>
                                                </GridItem>
                                                <GridItem sm={ 4 } md={ 12 }>
                                                    <Battery label='Risk Of Change' severity={ rule.resolution_risk }/>
                                                </GridItem>
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

                                                <Inventory items={ system.results.map(item => item.uuid) }/>
                                            ) }
                                            { systemFetchStatus === 'pending' && (<Loading/>) }
                                        </CardBody>
                                    </Card>
                                </StackItem>
                            </Stack>
                        ) }
                        { ruleFetchStatus === 'pending' && (<Loading/>) }
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
    system: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    system: state.AdvisorStore.system,
    systemFetchStatus: state.AdvisorStore.systemFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url)),
    fetchSystem: (url) => dispatch(AppActions.fetchSystem(url))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListActions));
