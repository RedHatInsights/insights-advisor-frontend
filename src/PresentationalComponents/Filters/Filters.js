/* eslint camelcase: 0 */
import React from 'react';
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

const Filters = (props) => {
    const changeSearchValue = debounce(
        value => {
            const filter = { ...props.filters };
            const text = value.length ? { text: value } : {};
            delete filter.text;
            props.setFilters({ ...filter, ...text });
            props.fetchAction({ ...filter, ...text });
        },
        800
    );

    const addFilter = (param, value, type) => {
        let newFilter;
        switch (type) {
            case 'checkbox':
                newFilter = props.filters[param] ? { [param]: `${props.filters[param]},${value}` } : { [param]: value };
                break;
            case 'radio':
                newFilter = { [param]: value };
                break;
        }

        props.setFilters({ ...props.filters, ...newFilter });
        props.fetchAction({ ...props.filters, ...newFilter });
    };

    const removeFilter = (key, value) => {
        const newFilter = { [key]: props.filters[key].split(',').filter(item => Number(item) !== Number(value)).join(',') };

        if (newFilter[key].length) {
            props.setFilters({ ...props.filters, ...newFilter });
            props.fetchAction({ ...props.filters, ...newFilter });
        } else {
            const filter = { ...props.filters };
            delete filter[key];
            props.setFilters(filter);
            props.fetchAction(filter);
        }
    };

    const removeAllFilters = () => {
        const defaultFilters = { impacting: true, reports_shown: true };
        props.setFilters(defaultFilters);
        props.fetchAction(defaultFilters);
    };

    const { children, searchPlaceholder, filters, hideCategories } = props;
    const previousChildren = React.Children.toArray(children);
    const lastChild = previousChildren.pop();

    return <>
        <ToolbarGroup>
            <ToolbarItem className='pf-u-mr-xl'>
                <InputGroup>
                    <TextInput name='search-input' aria-label='Search'
                        id='insights-search-input' type='search' value={ undefined }
                        placeholder={ searchPlaceholder } onChange={ changeSearchValue }
                    />
                    <Button variant={ ButtonVariant.tertiary } aria-label='search button for search input'>
                        <SearchIcon/>
                    </Button>
                </InputGroup>
            </ToolbarItem>
            <ToolbarItem className='pf-u-mr-md'>
                <FilterDropdown
                    filters={ filters }
                    addFilter={ addFilter }
                    removeFilter={ removeFilter }
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
                    <FilterChips filters={ filters } fetchAction={ props.fetchAction } removeFilter={ removeFilter }
                        removeAllFilters={ removeAllFilters }/>
                </ToolbarItem>
            </ToolbarGroup>
        </ToolbarSection>
    </>;
};

Filters.propTypes = {
    children: PropTypes.any,
    hideCategories: PropTypes.array,
    searchPlaceholder: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    fetchAction: PropTypes.func,
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
