/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { TextInput, Toolbar, ToolbarGroup, ToolbarItem, ToolbarSection } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import DropdownFilters from './DropdownFilters.js';

class Filters extends Component {
    componentWillUnmount () {
        this.props.setFilters({ });
    }

    changeSearchValue = debounce(
        value => {
            this.props.setFilters({ ...this.props.filters, text: value });
            this.props.fetchAction({ ...this.props.filters, text: value });
        },
        800
    );

    addFilter = (param, value) => {
        const newFilter = this.props.filters[param] ? { [param]: `${this.props.filters[param]},${value}` } : { [param]: value };
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

    render () {
        const { children, searchPlaceholder, filters, resultsCount, hideCategories } = this.props;
        return (
            <Toolbar className='pf-u-ml-xl pf-u-my-md'>
                <ToolbarGroup>
                    <ToolbarItem className='pf-u-mr-xl'>
                        <TextInput
                            aria-label='Search'
                            onChange={ this.changeSearchValue }
                            type='search'
                            value={ undefined }
                            placeholder={ searchPlaceholder }/>
                    </ToolbarItem>
                    <ToolbarItem className='pf-u-mr-md'>
                        <DropdownFilters
                            filters={ filters }
                            addFilter={ this.addFilter }
                            removeFilter={ this.removeFilter }
                            hideCategories={ hideCategories }
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                { children }
                <ToolbarSection aria-label="toolbar-results">
                    <ToolbarGroup>
                        <ToolbarItem>
                            { resultsCount === undefined && ('Loading...') }
                            { resultsCount !== undefined && `${resultsCount} result${resultsCount !== 1 ? 's' : ''}` }
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarSection>
            </Toolbar>
        );
    }
}

Filters.propTypes = {
    children: PropTypes.any,
    hideCategories: PropTypes.array,
    resultsCount: PropTypes.number,
    searchPlaceholder: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    fetchAction: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    filters: state.AdvisorStore.filters,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    setFilters: (filters) => AppActions.setFilters(filters)
}, dispatch);

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Filters));
