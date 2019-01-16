import React, { Component } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { routerParams, SimpleTableFilter } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { SEVERITY_MAP } from '../../AppConstants';
import './_filters.scss';

class Filters extends Component {
    state = {
        filters: {
            impacting: true,
            text: ''
        }
    };

    componentDidMount () {
        if (this.props.match.params.type.includes('-risk')) {
            const severity = SEVERITY_MAP[this.props.match.params.type];
            this.setState({ filters: { ...this.state.filters, severity }});
        } else {
            this.setState({ filters: { ...this.state.filters, category: this.props.match.params.type }});
        }
    }

    apply = () => this.props.apply(this.state.filters);

    changeFilterValue = debounce(
        value =>
            this.setState(
                {
                    filters: { ...this.state.filters, text: value }
                },
                this.apply
            ),
        400
    );

    render () {
        const { rules } = this.props;

        return (
            <Grid className='advisorFilters' gutter={ 'md' }>
                <GridItem span={ 4 }>
                    <SimpleTableFilter onFilterChange={ value => this.changeFilterValue(value) } buttonTitle={ null } />
                </GridItem>
                <GridItem span={ 6 } />
                <GridItem className='results' span={ 2 }>
                    { `${rules.count} result${rules.count !== 1 ? 's' : ''}` }
                </GridItem>
            </Grid>
        );
    }
}

Filters.propTypes = {
    apply: PropTypes.func,
    history: PropTypes.object,
    match: PropTypes.object,
    rules: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    ...ownProps
});

export default routerParams(connect(mapStateToProps, null)(Filters));
