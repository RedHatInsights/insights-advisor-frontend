/* eslint camelcase: 0 */
import React, { useEffect, useState } from 'react';
import { Button, ButtonVariant, InputGroup, TextInput, ToolbarGroup, ToolbarItem, ToolbarSection } from '@patternfly/react-core';
import { FilterDropdown } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FILTER_CATEGORIES } from '../../AppConstants';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import debounce from '../../Utilities/Debounce';
import { SearchIcon } from '@patternfly/react-icons';
import FilterChips from './FilterChips';

const Filters = (props) => {
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = debounce(searchText, 800);
    const { children, searchPlaceholder, filters, hideCategories, setFilters, fetchAction } = props;
    const previousChildren = React.Children.toArray(children);
    const lastChild = previousChildren.pop();

    const addFilter = (param, value, type) => {
        let newFilter;
        switch (type) {
            case 'checkbox':
                newFilter = filters[param] ? { [param]: `${filters[param]},${value}` } : { [param]: value };
                break;
            case 'radio':
                newFilter = { [param]: value };
                break;
        }

        setFilters({ ...filters, ...newFilter });
        fetchAction({ ...filters, ...newFilter });
    };

    const removeFilter = (key, value) => {
        const newFilter = { [key]: filters[key].split(',').filter(item => Number(item) !== Number(value)).join(',') };

        if (newFilter[key].length) {
            setFilters({ ...filters, ...newFilter });
            fetchAction({ ...filters, ...newFilter });
        } else {
            const filter = { ...filters };
            delete filter[key];
            setFilters(filter);
            fetchAction(filter);
        }
    };

    const removeAllFilters = () => {
        const defaultFilters = { impacting: true, reports_shown: true };
        setFilters(defaultFilters);
        fetchAction(defaultFilters);
    };

    useEffect(() => {
        setSearchText(filters.text);
        if (filters.text === undefined) {
            setSearchText('');
        }
    }, [filters.text]);

    useEffect(() => {
        const filter = { ...filters };
        const text = searchText.length ? { text: searchText } : {};
        delete filter.text;
        setFilters({ ...filter, ...text });
        fetchAction({ ...filter, ...text });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    return <>
        <ToolbarGroup>
            <ToolbarItem className='pf-u-mr-xl'>
                <InputGroup>
                    <TextInput name='search-input' aria-label='Search'
                        id='insights-search-input' type='search' value={searchText}
                        placeholder={searchPlaceholder}
                        onChange={setSearchText}
                    />
                    <Button variant={ButtonVariant.tertiary} aria-label='search button for search input'>
                        <SearchIcon />
                    </Button>
                </InputGroup>
            </ToolbarItem>
            <ToolbarItem className='pf-u-mr-md'>
                <FilterDropdown
                    filters={filters}
                    addFilter={addFilter}
                    removeFilter={removeFilter}
                    hideCategories={hideCategories}
                    filterCategories={FILTER_CATEGORIES}
                />
            </ToolbarItem>
            {React.Children.map(previousChildren, child => <ToolbarItem> {child} </ToolbarItem>)}
        </ToolbarGroup>
        <ToolbarGroup>
            <ToolbarItem>
                {lastChild}
            </ToolbarItem>
        </ToolbarGroup>
        <ToolbarSection aria-label="Filter Chips Section">
            <ToolbarGroup>
                <ToolbarItem>
                    <FilterChips filters={filters} fetchAction={fetchAction} removeFilter={removeFilter}
                        removeAllFilters={removeAllFilters} />
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
