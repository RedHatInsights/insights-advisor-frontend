/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Button, ButtonVariant, InputGroup, TextInput, ToolbarGroup, ToolbarItem, ToolbarSection } from '@patternfly/react-core';
import { FilterDropdown } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FILTER_CATEGORIES } from '../../AppConstants';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { SearchIcon } from '@patternfly/react-icons';
import FilterChips from './FilterChips';

class Filters extends Component {
    componentWillUnmount () {
        this.props.setFilters({});
    }

    componentDidUpdate (prevProps) {
        if (this.props.externalFilters !== prevProps.externalFilters) {
            this.props.setFilters(this.props.externalFilters);
        }
    }

    changeSearchValue = debounce(
        value => {
            const filter = { ...this.props.filters };
            const text = value.length ? { text: value } : {};
            delete filter.text;
            this.props.setFilters({ ...filter, ...text });
            this.props.fetchAction({ ...filter, ...text });
        },
        800
    );

    addFilter = (param, value, type) => {
        let newFilter;
        switch (type) {
            case 'checkbox':
                newFilter = this.props.filters[param] ? { [param]: `${this.props.filters[param]},${value}` } : { [param]: value };
                break;
            case 'radio':
                newFilter = { [param]: value };
                break;
        }

        this.props.setFilters({ ...this.props.filters, ...newFilter });
        this.props.fetchAction({ ...this.props.filters, ...newFilter });
    };

    removeFilter = (key, value) => {
        const newFilter = { [key]: this.props.filters[key].split(',').filter(item => Number(item) !== Number(value)).join(',') };

        if (newFilter[key].length) {
            this.props.setFilters({ ...this.props.filters, ...newFilter });
            this.props.fetchAction({ ...this.props.filters, ...newFilter });
        } else {
            const filter = { ...this.props.filters };
            delete filter[key];
            this.props.setFilters(filter);
            this.props.fetchAction(filter);
        }
    };

    removeAllFilters = () => {
        const defaultFilters = { reports_shown: true };
        this.props.setFilters(defaultFilters);
        this.props.fetchAction(defaultFilters);
    };

    render () {
        const { children, searchPlaceholder, filters, hideCategories } = this.props;
        const previousChildren = React.Children.toArray(children);
        const lastChild = previousChildren.pop();

        return (
            <>
                <ToolbarGroup>
                    <ToolbarItem className='pf-u-mr-xl'>
                        <InputGroup>
                            <TextInput name='search-input' aria-label='Search'
                                id='insights-search-input' type='search' value={ undefined }
                                placeholder={ searchPlaceholder } onChange={ this.changeSearchValue }
                            />
                            <Button variant={ ButtonVariant.tertiary } aria-label='search button for search input'>
                                <SearchIcon/>
                            </Button>
                        </InputGroup>
                    </ToolbarItem>
                    <ToolbarItem className='pf-u-mr-md'>
                        <FilterDropdown
                            filters={ filters }
                            addFilter={ this.addFilter }
                            removeFilter={ this.removeFilter }
                            hideCategories={ hideCategories }
                            filterCategories={ FILTER_CATEGORIES }
                        />
                    </ToolbarItem>
                    { React.Children.map(previousChildren, child => <ToolbarItem> { child } </ToolbarItem>) }
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem>
                        { lastChild }
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarSection aria-label="Filter Chips Section">
                    <ToolbarGroup>
                        <ToolbarItem>
                            <FilterChips filters={ filters } fetchAction={ this.props.fetchAction } removeFilter={ this.removeFilter }
                                removeAllFilters={ this.removeAllFilters }/>
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarSection>
            </>
        );
    }
}

Filters.propTypes = {
    children: PropTypes.any,
    hideCategories: PropTypes.array,
    searchPlaceholder: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    fetchAction: PropTypes.func,
    externalFilters: PropTypes.object,
    results: PropTypes.number
};

const mapStateToProps = (state, ownProps) => ({
    filters: state.AdvisorStore.filters,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    setFilters: (filters) => AppActions.setFilters(filters)
}, dispatch);

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Filters));
