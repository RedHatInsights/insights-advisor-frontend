import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';
import { invert, capitalize } from 'lodash';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { SEVERITY_MAP } from '../../AppConstants';

import '../../App.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const SummaryChartItem = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChartItem'));
const ConditionalLink = asyncComponent(() => import('../../PresentationalComponents/ConditionalLink/ConditionalLink'));
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

     summaryChart = (totalRisk, totalIssues) => Object.entries(totalRisk).map(([ key, value ]) => {
         const riskName = invert(SEVERITY_MAP)[key];
         const normalizedRiskName = capitalize(riskName.split('-')[0]);

         return  <ConditionalLink
             key={ key }
             condition={ value }
             wrap={ children =>
                 <Link to={ `/actions/${riskName}` }>
                     { children }
                 </Link>
             }>
             <SummaryChartItem
                 name={ normalizedRiskName }
                 numIssues={ value }
                 totalIssues={ totalIssues }/>
         </ConditionalLink>;
     });

     render () {
         const {
             statsFetchStatus
         } = this.props;

         const { totalRisk, category, total } = this.state;

         return (
            <>
                <PageHeader>
                    <PageHeaderTitle title='Overview'/>
                </PageHeader>
                <Main className='pf-m-light pf-u-box-shadow-md-bottom'>
                    <Grid gutter='lg'>
                        <GridItem className='pf-u-pr-xl-on-xl pf-u-mr-xl-on-xl' xl={ 4 } lg={ 4 } md={ 8 } sm={ 8 }>
                            <Title size='lg' headingLevel='h3'>Risk Summary</Title>
                            { statsFetchStatus === 'fulfilled' && (
                                <SummaryChart className='pf-u-mt-md'>
                                    { this.summaryChart(totalRisk, total) }
                                </SummaryChart>
                            ) }
                            { statsFetchStatus === 'pending' && (<Loading/>) }
                        </GridItem>
                        <GridItem xl={ 6 } lg={ 7 } md={ 11 } sm={ 8 }>
                            <Title size='lg' headingLevel='h3'>Rule hits by category</Title>
                            { statsFetchStatus === 'fulfilled' && (
                                <ActionsOverviewDonut category={ category } className='pf-u-mt-md'/>
                            ) }
                            { statsFetchStatus === 'pending' && (<Loading/>) }
                        </GridItem>
                    </Grid>
                </Main>
                <Main>&nbsp;</Main>
             </>
         );
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
