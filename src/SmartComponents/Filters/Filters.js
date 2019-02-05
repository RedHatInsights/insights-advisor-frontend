import React, { Component } from 'react';
import { Grid, GridItem, TextInput } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { SEVERITY_MAP } from '../../AppConstants';
import DropdownFilters from './DropdownFilters.js';
import '@patternfly/patternfly-next/utilities/Flex/flex.css';

class Filters extends Component {
    state = {
        filters: {
            impacting: true,
            text: ''
        }
    };

    componentDidMount () {
        if (this.props.match.params.type !== undefined) {
            this.setType(this.props.match.params.type);
        }
    }

    setType(type) {
        if (type.includes('-risk')) {
            const severity = SEVERITY_MAP[type];
            this.setState({ filters: { ...this.state.filters, severity }});
        } else {
            this.setState({ filters: { ...this.state.filters, category: type }});
        }
    }

    apply = () => {
        this.props.fetchRules({ ...this.props.externalFilters, ...this.state.filters }); // eslint-disable-line camelcase
    };

    changeSearchValue = debounce(
        value =>
            this.setState(
                {
                    filters: { ...this.state.filters, text: value }
                },
                this.apply
            ),
        800
    );

    addFilter = (key, value) => {
        let filter = {};
        filter[key] = value;
        this.setState({ filters: { filter, ...this.state.filters }}, this.apply);
    }

    removeFilter = (key) => {
        // probably have to copy this.state.filters with Object.assign, delete, then update state
        this.setState(delete this.state.filters[key], this.apply);
    }

    render () {
        const { children, match, rules } = this.props;
        const { text } = this.state.filters.text;

        return (
            <Grid className='advisorFilters'>
                <GridItem span={ 4 }>
                    <TextInput aria-label='Search' onChange={ this.changeSearchValue } type='search' value={ text } />
                </GridItem>
                { match.params.type === undefined && <GridItem span={ 3 } >
                    <DropdownFilters
                        addFilter={ this.addFilter }
                        className='advisorDropdownFilters'
                        removeFilter={ this.removeFilter }
                    />
                </GridItem> }
                <GridItem span={ 3 } >{ children }</GridItem>
                <GridItem span={ 2 } className='pf-u-display-flex pf-u-flex-direction-row-reverse pf-u-flex-align-content-center'>
                    { rules.count === undefined && ('Loading...') }
                    { rules.count !== undefined && `${rules.count} result${rules.count !== 1 ? 's' : ''}` }
                </GridItem>
            </Grid>
        );
    }
}

Filters.propTypes = {
    children: PropTypes.any,
    externalFilters: PropTypes.object,
    fetchRules: PropTypes.func,
    match: PropTypes.object,
    rules: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchRules: (url) => AppActions.fetchRules(url)
}, dispatch);

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Filters));
