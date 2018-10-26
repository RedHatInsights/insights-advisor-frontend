import React, { Component } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import * as AppActions from '../../AppActions';
import DropdownSort from './DropdownSort.js';
import PropTypes from 'prop-types';
import queryString from 'query-string';

class Filters extends Component {
    constructor (props) {
        super(props);

        this.updateFilters = this.updateFilters.bind(this);
    }

    updateFilters (filter) {
        this.props.setCurrentFilters(filter);

        this.props.history.push({
            pathname: this.props.history.pathname,
            search: queryString.stringify(filter)
        });
    }

    render () {
        return (
            <Grid gutter='sm'>
                <GridItem md={ 4 } sm={ 4 }>
                    <DropdownSort
                        className='dropdownTotalRisk'
                        title='Sort by Total Risk'
                        dropdownItems={ [ 'All', 'Low', 'Medium', 'High', 'Critical' ] }
                        dropdownValues={ [ 'ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL' ] }
                        updateFilters={ this.updateFilters }
                    />
                </GridItem>
            </Grid>
        );
    }
}

Filters.propTypes = {
    currentFilters: PropTypes.object,
    history: PropTypes.object,
    setCurrentFilters: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    currentFilters: state.AdvisorStore.currentFilters,
    setCurrentFilters: state.AdvisorStore.setCurrentFilters,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setCurrentFilters: (obj) => dispatch(AppActions.setCurrentFilters(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Filters));
