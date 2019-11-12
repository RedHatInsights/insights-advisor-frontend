/* eslint camelcase: 0 */
import React, { Component } from 'react';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Flex, FlexItem, Level, LevelItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { global_Color_100, global_primary_color_100 } from '@patternfly/react-tokens';
import { ChartSpikeIcon } from '@patternfly/react-icons';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { ANSIBLE_MARK_ICON, GLOBAL_ECONSYSTEM_ICON, SERVER_STACK_ICON } from '../../AppSvgs';
import messages from '../../Messages';

import '../../App.scss';
import './Dashboard.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const OverviewDonut = asyncComponent(() => import('../../PresentationalComponents/Charts/OverviewDonut'));

class OverviewDashboard extends Component {
    state = {
        total: -1,
        category: []
    };

    async componentDidMount() {
        this.props.fetchStatsRules();
        this.props.fetchStatsSystems();
    }

    componentDidUpdate(prevProps) {
        if (this.props.statsRules !== prevProps.statsRules) {
            const rules = this.props.statsRules;
            this.setState({
                category: [rules.category.Availability, rules.category.Stability, rules.category.Performance, rules.category.Security]
            });
            this.setState({ total: rules.total });
        }
    }

    render() {
        const {
            statsRulesFetchStatus, statsSystemsFetchStatus, statsRules, statsSystems, intl
        } = this.props;
        const { category, total } = this.state;
        return <>
            <PageHeader>
                <PageHeaderTitle title={intl.formatMessage(messages.overview)} />
            </PageHeader>
            {total !== 0 ?
                <>
                    <Main className='pf-m-light mainPaddingOverride'>
                        <Level className='levelAlignOverride'>
                            <LevelItem className='levelItemPaddingOverride'>
                                <Title size='lg' headingLevel='h3'>{intl.formatMessage(messages.overviewSeverityChartTitle)}</Title>
                                {statsRulesFetchStatus === 'fulfilled' && statsSystemsFetchStatus === 'fulfilled' ? (
                                    <SummaryChart rulesTotalRisk={statsRules.total_risk} reportsTotalRisk={statsSystems.total_risk} />
                                )
                                    : (<Loading />)
                                }
                            </LevelItem>
                            <LevelItem>
                                <Title size='lg' headingLevel='h3'>{intl.formatMessage(messages.overviewCategoryChartTitle)}</Title>
                                {statsRulesFetchStatus === 'fulfilled' ? (
                                    <OverviewDonut category={category} className='pf-u-mt-md' />
                                )
                                    : (<Loading />)}
                            </LevelItem>
                            <LevelItem>&nbsp;</LevelItem>
                        </Level>
                    </Main>
                    <Main>
                        <Main className='pf-m-light'>
                            <Title size='2xl' headingLevel='h1'>{intl.formatMessage(messages.overviewActioncallTitle)}</Title>
                            <Level>
                                <LevelItem className='maxWidthOverride'>
                                    <Flex breakpointMods={[{ modifier: 'column' }]}>
                                        <FlexItem>
                                            <MessageState
                                                iconStyle={{ color: global_Color_100.value }}
                                                icon={() => SERVER_STACK_ICON}
                                                title={intl.formatMessage(messages.overviewConnectsystemsTitle)}
                                                text={<span key='1'>
                                                    {intl.formatMessage(messages.overviewConnectsystemsBody)}
                                                </span>}>
                                                <Button component="a" href="https://access.redhat.com/products/red-hat-insights#getstarted"
                                                    target="_blank" variant="link">
                                                    {intl.formatMessage(messages.overviewConnectsystemsAction)}
                                                </Button>
                                            </MessageState>
                                        </FlexItem>
                                    </Flex>
                                </LevelItem>
                                <LevelItem className='maxWidthOverride'>
                                    <Flex breakpointMods={[{ modifier: 'column' }]}>
                                        <FlexItem>
                                            <MessageState
                                                className='svgAlignmentOverride'
                                                iconStyle={{ color: global_Color_100.value }}
                                                icon={() => ANSIBLE_MARK_ICON}
                                                title={intl.formatMessage(messages.overviewRemediateTitle)}
                                                text={<span key='1'>
                                                    {intl.formatMessage(messages.overviewRemediateBody)}
                                                </span>}>
                                                <Button component="a" href="https://cloud.redhat.com/insights/remediations"
                                                    target="_blank" variant="link">
                                                    {intl.formatMessage(messages.overviewRemediateAction)}
                                                </Button>
                                            </MessageState>
                                        </FlexItem>
                                    </Flex>
                                </LevelItem>
                                <LevelItem className='maxWidthOverride'>
                                    <Flex breakpointMods={[{ modifier: 'column' }]}>
                                        <FlexItem>
                                            <MessageState
                                                iconStyle={{ color: global_Color_100.value }}
                                                icon={() => GLOBAL_ECONSYSTEM_ICON}
                                                title={intl.formatMessage(messages.overviewDeployTitle)}
                                                text={<span key='1'>
                                                    {intl.formatMessage(messages.overviewDeployBody, {
                                                        linkansible(link) {
                                                            return <a rel="noopener noreferrer" target="_blank"
                                                                href="https://galaxy.ansible.com/redhatinsights/insights-client">{link}</a>;
                                                        },
                                                        linkpuppet(link) {
                                                            return <a rel="noopener noreferrer" target="_blank"
                                                                href="https://forge.puppetlabs.com/lphiri/access_insights_client">{link}</a>;
                                                        }
                                                    })}
                                                </span>}>
                                                <Button component="a" href="https://galaxy.ansible.com/redhatinsights/insights-client"
                                                    target="_blank" variant="secondary">
                                                    {intl.formatMessage(messages.overviewDeployAction)}
                                                </Button>
                                            </MessageState>
                                        </FlexItem>
                                    </Flex>
                                </LevelItem>
                            </Level>
                        </Main>
                    </Main>
                </>
                : <Main>
                    <MessageState
                        iconStyle={{ color: global_primary_color_100.value }}
                        icon={ChartSpikeIcon}
                        title={intl.formatMessage(messages.overviewActioncallTitle)}
                        text={<span key='1'>
                            {intl.formatMessage(messages.overviewActionCallNoSystemsBody, { break() { return <br />; } })}
                        </span>}>
                        <Button component="a" href="https://access.redhat.com/products/red-hat-insights#getstarted"
                            target="_blank" variant="primary">
                            {intl.formatMessage(messages.overviewActionCallNoSystemsAction)}
                        </Button>
                    </MessageState>
                </Main>}
        </>;
    }
}

OverviewDashboard.propTypes = {
    match: PropTypes.object,
    statsRulesFetchStatus: PropTypes.string,
    statsRules: PropTypes.object,
    fetchStatsRules: PropTypes.func,
    statsSystemsFetchStatus: PropTypes.string,
    statsSystems: PropTypes.object,
    fetchStatsSystems: PropTypes.func,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    statsRules: state.AdvisorStore.statsRules,
    statsRulesFetchStatus: state.AdvisorStore.statsRulesFetchStatus,
    statsSystems: state.AdvisorStore.statsSystems,
    statsSystemsFetchStatus: state.AdvisorStore.statsSystemsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStatsRules: (url) => dispatch(AppActions.fetchStatsRules(url)),
    fetchStatsSystems: (url) => dispatch(AppActions.fetchStatsSystems(url))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDashboard)));
