/* eslint camelcase: 0 */
import React, { Component } from 'react';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Level, LevelItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { global_Color_100, global_primary_color_100 } from '@patternfly/react-tokens';
import { ChartSpikeIcon } from '@patternfly/react-icons';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '../../App.scss';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { ANSIBLE_MARK_ICON, GLOBAL_ECONSYSTEM_ICON, SERVER_STACK_ICON } from '../../AppSvgs';
import './Dashboard.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const OverviewDonut = asyncComponent(() => import('../../PresentationalComponents/Charts/OverviewDonut'));

class OverviewDashboard extends Component {
    state = {
        total: -1,
        category: []
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.fetchStatsRules();
        this.props.fetchStatsSystems();
        this.props.setBreadcrumbs([{ title: 'Overview', navigate: '/overview' }]);
    }

    componentDidUpdate (prevProps) {
        if (this.props.statsRules !== prevProps.statsRules) {
            const rules = this.props.statsRules;
            this.setState({
                category: [ rules.category.Availability, rules.category.Stability, rules.category.Performance, rules.category.Security ]
            });
            this.setState({ total: rules.total });
        }
    }

    render () {
        const {
            statsRulesFetchStatus, statsSystemsFetchStatus, statsRules, statsSystems
        } = this.props;
        const { category, total } = this.state;
        return <>
            <PageHeader>
                <PageHeaderTitle title='Overview'/>
            </PageHeader>
            { total !== 0 ?
                <>
                    <Main className='pf-m-light mainPaddingOverride ins-test'>
                        <Level className='levelAlignOverride'>
                            <LevelItem className='levelItemPaddingOverride'>
                                <Title size='lg' headingLevel='h3'>Rule hits by severity</Title>
                                { statsRulesFetchStatus === 'fulfilled' && statsSystemsFetchStatus === 'fulfilled' ? (
                                    <SummaryChart rulesTotalRisk={ statsRules.total_risk } reportsTotalRisk={ statsSystems.total_risk }/>
                                )
                                    : (<Loading/>)
                                }
                            </LevelItem>
                            <LevelItem>
                                <Title size='lg' headingLevel='h3'>Rule hits by category</Title>
                                { statsRulesFetchStatus === 'fulfilled' ? (
                                    <OverviewDonut category={ category } className='pf-u-mt-md'/>
                                )
                                    : (<Loading/>) }
                            </LevelItem>
                            <LevelItem>&nbsp;</LevelItem>
                        </Level>
                    </Main>
                    <Main>
                        <Main className='pf-m-light'>
                            <Title size='2xl' headingLevel='h1'>Get started with Red Hat Insights</Title>
                            <Level>
                                <LevelItem style={ { maxWidth: '400px' } }>
                                    <MessageState
                                        iconStyle={ { color: global_Color_100.value } }
                                        icon={ () => SERVER_STACK_ICON }
                                        title='Connect your first systems'
                                        text={ <span key='1'>Connect at least 10 systems to get a better<br/>
                            awareness of issues and optimizations<br/>
                            identified across your infastructure</span> }>
                                        <Button component="a" href="https://access.redhat.com/products/red-hat-insights#getstarted"
                                            target="_blank" variant="link">
                                            Learn how to connect a system to insights
                                        </Button>
                                    </MessageState>
                                </LevelItem>
                                <LevelItem style={ { maxWidth: '400px' } }>
                                    <MessageState
                                        iconStyle={ { color: global_Color_100.value } }
                                        icon={ () => ANSIBLE_MARK_ICON }
                                        title='Remediate Insights findings with Ansible'
                                        text={ <span key='1'>Easily generate an Ansible playbook to<br/>
                            quickly and effectively remediate Insights <br/> findings</span> }>
                                        <Button component="a" href="https://cloud.redhat.com/insights/remediations"
                                            target="_blank" variant="link">
                                            Get started with Insights and Ansible Playbooks
                                        </Button>
                                    </MessageState>
                                </LevelItem>
                                <LevelItem style={ { maxWidth: '400px' } }>
                                    <MessageState
                                        iconStyle={ { color: global_Color_100.value } }
                                        icon={ () => GLOBAL_ECONSYSTEM_ICON }
                                        title='Deploy Insights at scale'
                                        text={ <span key='1'>Get more out of Insights with more systems.<br/>
                            Quickly connect systems with <a rel="noopener noreferrer" target="_blank"
                                                href="https://galaxy.ansible.com/redhatinsights/insights-client">Ansible</a> <br/> or
                                            <a rel="noopener noreferrer" target="_blank"
                                                href="https://forge.puppetlabs.com/lphiri/access_insights_client"> Puppet</a></span> }>
                                        <Button component="a" href="https://galaxy.ansible.com/redhatinsights/insights-client"
                                            target="_blank" variant="secondary">
                                            Download Ansible Playbook
                                        </Button>
                                    </MessageState>
                                </LevelItem>
                            </Level>
                        </Main>
                    </Main>
                </>
                : <Main>
                    <MessageState
                        iconStyle={ { color: global_primary_color_100.value } }
                        icon={ ChartSpikeIcon }
                        title='Get started with Red Hat Insights'
                        text={ <span key='1'>With predictive analytics, avoid problems and unplanned<br/>
                            downtime in your Red Hat environment. Red Hat Insights is<br/>
                            included with your Red Hat Enterprise Linux subscription</span> }>
                        <Button component="a" href="https://access.redhat.com/insights/getting-started/" target="_blank" variant="primary">
                            Get started
                        </Button>
                    </MessageState>
                </Main> }
        </>;
    }
}

OverviewDashboard.propTypes = {
    match: PropTypes.object,
    breadcrumbs: PropTypes.array,
    setBreadcrumbs: PropTypes.func,
    statsRulesFetchStatus: PropTypes.string,
    statsRules: PropTypes.object,
    fetchStatsRules: PropTypes.func,
    statsSystemsFetchStatus: PropTypes.string,
    statsSystems: PropTypes.object,
    fetchStatsSystems: PropTypes.func

};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    statsRules: state.AdvisorStore.statsRules,
    statsRulesFetchStatus: state.AdvisorStore.statsRulesFetchStatus,
    statsSystems: state.AdvisorStore.statsSystems,
    statsSystemsFetchStatus: state.AdvisorStore.statsSystemsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStatsRules: (url) => dispatch(AppActions.fetchStatsRules(url)),
    fetchStatsSystems: (url) => dispatch(AppActions.fetchStatsSystems(url)),
    setBreadcrumbs: (obj) => dispatch(AppActions.setBreadcrumbs(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDashboard));
