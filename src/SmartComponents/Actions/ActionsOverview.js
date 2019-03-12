import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Grid, GridItem } from '@patternfly/react-core';
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
       this.props.setBreadcrumbs([{ title: 'Actions', navigate: '/actions' }]);
   }

   componentDidUpdate (prevProps) {
       if (this.props.stats !== prevProps.stats) {
           const rules = this.props.stats.rules;
           this.setState({ totalRisk: rules.total_risk });
           this.setState({
               category: [ rules.category.Availability, rules.category.Security, rules.category.Stability, rules.category.Performance ]
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
             <React.Fragment>
                 <PageHeader>
                     <PageHeaderTitle title='Actions'/>
                 </PageHeader>
                 <Main>
                     <Grid gutter='lg' xl={ 5 } lg={ 8 } md={ 2 } sm={ 1 }>
                         <GridItem  xl={ 5 } lg={ 6 } md={ 9 } sm={ 6 }>
                             <Card className='pf-t-light  pf-m-opaque-100'>
                                 <CardHeader>Category Summary</CardHeader>
                                 <CardBody>
                                     { statsFetchStatus === 'fulfilled' && (
                                         <ActionsOverviewDonut category={ category }/>
                                     ) }
                                     { statsFetchStatus === 'pending' && (<Loading/>) }
                                 </CardBody>
                             </Card>
                         </GridItem>
                         <GridItem xl={ 3 } lg={ 4 } md={ 5 } sm={ 4 }>
                             <Card className='pf-t-light  pf-m-opaque-100'>
                                 <CardHeader>Risk Summary</CardHeader>
                                 <CardBody>
                                     { statsFetchStatus === 'fulfilled' && (
                                         <SummaryChart>
                                             { this.summaryChart(totalRisk, total) }
                                         </SummaryChart>
                                     ) }
                                     { statsFetchStatus === 'pending' && (<Loading/>) }
                                 </CardBody>
                             </Card>
                         </GridItem>
                     </Grid>
                 </Main>
             </React.Fragment>
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
