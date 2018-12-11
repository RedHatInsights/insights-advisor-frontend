import React, { Component } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import * as AppActions from '../../AppActions';
import Search from './Search.js';
import DropdownSort from './DropdownSort.js';
import PropTypes from 'prop-types';
import queryString from 'query-string';

class Filters extends Component {
    constructor (props) {
        super(props);

        this.addUrlParameter = this.addUrlParameter.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.updateSort = this.updateSort.bind(this);
        this.validateParams = this.validateParams.bind(this);
    }

    updateSort (sort) {
        this.props.setCurrentSort(sort);
        this.addUrlParameter(sort);
    }

    updateFilters (filter) {
        this.props.setCurrentFilters(filter);
        this.addUrlParameter(filter);
    }

    addUrlParameter (param) {
        let paramsObj = {};
        Object.keys(this.props.currentUrlParameters).map((key, index) => {
            paramsObj[key] = Object.values(this.props.currentUrlParameters)[index];
        });
        paramsObj[Object.keys(param)[0]] = param[Object.keys(param)[0]];
        this.props.history.push({
            pathname: this.props.history.pathname,
            search: queryString.stringify(paramsObj)
        });
        this.props.setCurrentUrlParameters(param);
    }

    validateParams (param) {
        const validParams = [
            'search',
            'sortBy'
        ];
        if (validParams.indexOf(Object.keys(param)[0]) > -1) { return true; }

        return false;
    }

    render () {
        const { onPage } = this.props;

        return (
            <Grid gutter='sm'>
                <GridItem md={ 8 } sm={ 6 }>
                    <Search
                        className='advisorSearch'
                        placeholder='Find a rule'
                        searchTerm={ this.props.currentFilters.search }
                        updateFilters={ this.updateFilters }
                    />
                </GridItem>
                { onPage === 'viewactions' && (
                    <GridItem md={ 4 } sm={ 4 }>
                        <DropdownSort
                            className='dropdownTotalRisk'
                            title='Sort by Total Risk'
                            dropdownItems={ [ 'All', 'Low', 'Medium', 'High', 'Critical' ] }
                            dropdownValues={ [ 'ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL' ] }
                            updateSort={ this.updateSort }
                        />
                    </GridItem>
                ) }
            </Grid>
        );
    }
}

Filters.propTypes = {
    currentFilters: PropTypes.object,
    currentUrlFilters: PropTypes.object,
    currentUrlParameters: PropTypes.object,
    onPage: PropTypes.string,
    history: PropTypes.object,
    setCurrentFilters: PropTypes.func,
    setCurrentSort: PropTypes.func,
    setCurrentUrlParameters: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    currentFilters: state.AdvisorStore.currentFilters,
    currentSort: state.AdvisorStore.currentSort,
    currentUrlParameters: state.AdvisorStore.currentUrlParameters,
    setCurrentFilters: state.AdvisorStore.setCurrentFilters,
    setCurrentSort: state.AdvisorStore.setCurrentSort,
    setCurrentUrlParameters: state.AdvisorStore.setCurrentUrlParams,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setCurrentFilters: (obj) => dispatch(AppActions.setCurrentFilters(obj)),
    setCurrentSort: (obj) => dispatch(AppActions.setCurrentSort(obj)),
    setCurrentUrlParameters: (obj) => dispatch(AppActions.setCurrentUrlParams(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Filters));
