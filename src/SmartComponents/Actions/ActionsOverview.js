import React, { Component } from 'react';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Gallery, GalleryItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '../../App.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const ActionsOverviewDonut = asyncComponent(() => import('../../PresentationalComponents/Charts/ActionsOverviewDonut'));

class ActionsOverview extends Component {
    state = {
        totalRisk: {},
        total: 0,
        category: []
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.fetchStats();
        this.props.setBreadcrumbs([{ title: 'Overview', navigate: '/actions' }]);
    }

    componentDidUpdate (prevProps) {
        if (this.props.stats !== prevProps.stats) {
            const rules = this.props.stats.rules;
            this.setState({ totalRisk: rules.total_risk });
            this.setState({
                category: [ rules.category.Availability, rules.category.Stability, rules.category.Performance, rules.category.Security ]
            });
            this.setState({ total: rules.total });
        }
    }

    render () {
        const {
            statsFetchStatus
        } = this.props;

        const { totalRisk, category, total } = this.state;

        return <>
            <PageHeader>
                <PageHeaderTitle title='Overview'/>
            </PageHeader>
            <Main className='pf-m-light'>
                <Gallery gutter="lg">
                    <GalleryItem>
                        <Title size='lg' headingLevel='h3'>Rule hits by severity</Title>
                        { statsFetchStatus === 'fulfilled' && (
                            <SummaryChart totalRisk={ totalRisk } totalIssues={ total }/>
                        ) }
                        { statsFetchStatus === 'pending' && (<Loading/>) }
                    </GalleryItem>
                    <GalleryItem>
                        <Title size='lg' headingLevel='h3'>Rule hits by category</Title>
                        { statsFetchStatus === 'fulfilled' && (
                            <ActionsOverviewDonut category={ category } className='pf-u-mt-md'/>
                        ) }
                        { statsFetchStatus === 'pending' && (<Loading/>) }
                    </GalleryItem>
                </Gallery>
            </Main>
            <Main>&nbsp;</Main>
        </>;
    }
}

ActionsOverview.propTypes = {
    match: PropTypes.object,
    breadcrumbs: PropTypes.array,
    fetchStats: PropTypes.func,
    setBreadcrumbs: PropTypes.func,
    statsFetchStatus: PropTypes.string,
    stats: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    stats: state.AdvisorStore.stats,
    statsFetchStatus: state.AdvisorStore.statsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStats: (url) => dispatch(AppActions.fetchStats(url)),
    setBreadcrumbs: (obj) => dispatch(AppActions.setBreadcrumbs(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ActionsOverview));
