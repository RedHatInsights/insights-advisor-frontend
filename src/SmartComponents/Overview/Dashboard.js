/* eslint camelcase: 0 */
import './Dashboard.scss';

import * as AppActions from '../../AppActions';

import { ANSIBLE_MARK_ICON, GLOBAL_ECONSYSTEM_ICON, SERVER_STACK_ICON } from '../../AppSvgs';
import { Level, LevelItem } from '@patternfly/react-core/dist/js/layouts/Level/index';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack/index';

import { Bullseye } from '@patternfly/react-core/dist/js/layouts/Bullseye/Bullseye';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import ChartSpikeIcon from '@patternfly/react-icons/dist/js/icons/chartSpike-icon';
import { ClipboardCopy } from '@patternfly/react-core/dist/js/components/ClipboardCopy/ClipboardCopy';
import { Flex } from '@patternfly/react-core/dist/js/layouts/Flex/Flex';
import { FlexItem } from '@patternfly/react-core/dist/js/layouts/Flex/FlexItem';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { connect } from 'react-redux';
import global_Color_100 from '@patternfly/react-tokens/dist/js/global_Color_100';
import global_primary_color_100 from '@patternfly/react-tokens/dist/js/global_primary_color_100';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const SummaryChart = lazy(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const OverviewDonut = lazy(() => import('../../PresentationalComponents/Charts/OverviewDonut'));
const SystemInventory = lazy(() => import('../../PresentationalComponents/Charts/SystemInventory'));
const TagsToolbar = lazy(() => import('../../PresentationalComponents/TagsToolbar/TagsToolbar'));

const OverviewDashboard = ({ statsRulesFetchStatus, statsSystemsFetchStatus, statsRules, statsSystems, intl,
    fetchStatsRules, fetchStatsSystems, selectedTags, statsStaleHosts, statsStaleHostsFetchStatus, fetchStatsStaleHosts }) => {
    const [total, setTotal] = useState(-1);
    const [category, setCategory] = useState([]);

    useEffect(() => {
        const options = selectedTags.length && ({ tags: selectedTags.join() });
        fetchStatsRules(options);
        fetchStatsSystems(options);
        fetchStatsStaleHosts(options);
    }, [fetchStatsStaleHosts, fetchStatsRules, fetchStatsSystems, selectedTags]);

    useEffect(() => {
        if (statsRules !== undefined && statsRules.category !== undefined) {
            const category = statsRules.category;
            setCategory([category.Availability, category.Stability, category.Performance, category.Security]);
            setTotal({ total: statsRules.total });
        }
    }, [statsRules]);

    return <React.Fragment>
        <Suspense fallback={<Loading />}>
            <TagsToolbar />
        </Suspense>
        <PageHeader>
            <PageHeaderTitle title={intl.formatMessage(messages.overview)} />
        </PageHeader>
        {total !== 0 ?
            <React.Fragment>
                <Main className='pf-m-light mainPaddingOverride'>
                    <Level className='levelAlignOverride'>
                        <LevelItem className='levelItemPaddingOverride'>
                            <Title size='lg' headingLevel='h3'>{intl.formatMessage(messages.overviewSeverityChartTitle)}</Title>
                            {statsRulesFetchStatus === 'fulfilled' && statsSystemsFetchStatus === 'fulfilled' ? (
                                <Suspense fallback={<Loading />}>
                                    <SummaryChart rulesTotalRisk={statsRules.total_risk} reportsTotalRisk={statsSystems.total_risk} />
                                </Suspense>)
                                : (<Loading />)
                            }
                        </LevelItem>
                        <LevelItem>
                            <Title size='lg' headingLevel='h3'>{intl.formatMessage(messages.overviewCategoryChartTitle)}</Title>
                            {statsRulesFetchStatus === 'fulfilled' && category.length ? (
                                <Suspense fallback={<Loading />}>
                                    <OverviewDonut category={category} className='pf-u-mt-md' />
                                </Suspense>
                            )
                                : (<Loading />)}
                        </LevelItem>
                        <LevelItem>
                            <Title size='lg' headingLevel='h3'>{intl.formatMessage(messages.overviewSystemInventory)}</Title>
                            {statsStaleHostsFetchStatus === 'fulfilled' ? (
                                <Suspense fallback={<Loading />}>
                                    <SystemInventory staleHosts={statsStaleHosts} className='pf-u-mt-md' />
                                </Suspense>)
                                : (<Loading />)}
                        </LevelItem>
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
                                            text={<span>
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
                                            text={<span>
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
                                            text={<span>
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
            </React.Fragment>
            : <Main>
                <MessageState
                    iconStyle={{ color: global_primary_color_100.value }}
                    icon={ChartSpikeIcon}
                    title={intl.formatMessage(messages.overviewActioncallTitle)}
                    text={<span>
                        {intl.formatMessage(messages.overviewActionCallNoSystemsBody, { break() { return <br />; } })}
                    </span>}>
                    <Bullseye>
                        <Stack gutter="md">
                            <StackItem>
                                1. {intl.formatMessage(messages.installClient)}
                                <ClipboardCopy>yum install insights-client</ClipboardCopy>
                            </StackItem>
                            <StackItem>
                                2. {intl.formatMessage(messages.registerSystem)}
                                <ClipboardCopy>insights-client --register</ClipboardCopy>
                            </StackItem>
                        </Stack>
                    </Bullseye>
                    <Button component="a" href="https://access.redhat.com/products/red-hat-insights#getstarted"
                        target="_blank" variant="primary">
                        {intl.formatMessage(messages.overviewActionCallNoSystemsAction)}
                    </Button>
                </MessageState>
            </Main>}
    </React.Fragment>;
};

OverviewDashboard.propTypes = {
    match: PropTypes.object,
    statsRulesFetchStatus: PropTypes.string,
    statsRules: PropTypes.object,
    fetchStatsRules: PropTypes.func,
    statsSystemsFetchStatus: PropTypes.string,
    statsSystems: PropTypes.object,
    fetchStatsSystems: PropTypes.func,
    selectedTags: PropTypes.array,
    statsStaleHostsFetchStatus: PropTypes.string,
    statsStaleHosts: PropTypes.object,
    fetchStatsStaleHosts: PropTypes.func,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    statsRules: state.AdvisorStore.statsRules,
    statsRulesFetchStatus: state.AdvisorStore.statsRulesFetchStatus,
    statsSystems: state.AdvisorStore.statsSystems,
    statsSystemsFetchStatus: state.AdvisorStore.statsSystemsFetchStatus,
    selectedTags: state.AdvisorStore.selectedTags,
    statsStaleHosts: state.AdvisorStore.statsStaleHosts,
    statsStaleHostsFetchStatus: state.AdvisorStore.statsStaleHostsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStatsRules: (url) => dispatch(AppActions.fetchStatsRules(url)),
    fetchStatsSystems: (url) => dispatch(AppActions.fetchStatsSystems(url)),
    fetchStatsStaleHosts: (url) => dispatch(AppActions.fetchStatsStaleHosts(url))

});

export default injectIntl(routerParams(connect(mapStateToProps, mapDispatchToProps)(OverviewDashboard)));
