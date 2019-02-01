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
    componentDidMount () {
        if (this.props.match.params.type !== undefined) {
            this.setType(this.props.match.params.type);
        }
    }

    changeSearchValue = debounce(
        value =>{
            this.props.setFilters({ ...this.props.filters, text: value });
            this.props.fetchRules({ ...this.props.filters, text: value });
        },
        800
    );

    addFilter = (param, value) => {
        this.props.setFilters({ ...this.props.filters, [param]: value });
        this.props.fetchRules({ ...this.props.filters, [param]: value });

    };

    removeFilter = (key, value) => {
        // where we'll remove params
        console.warn(key, value);
    };

    render () {
        const { children, match, rules, searchPlaceholder } = this.props;
        return (
            <Toolbar className='pf-u-justify-content-space-between pf-u-ml-xl pf-u-my-md'>
                <ToolbarGroup>
                    <ToolbarItem className='pf-u-mr-xl'>
                        <TextInput
                            aria-label='Search'
                            onChange={ this.changeSearchValue }
                            type='search'
                            value={ undefined }
                            placeholder={ searchPlaceholder }/>
                    </ToolbarItem>
                    <ToolbarItem className='pf-u-mr-md' >
                        { match.params.type === undefined &&
                            <DropdownFilters
                                addFilter={ this.addFilter }
                                removeFilter={ this.removeFilter }
                            /> }
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem >
                        { children }
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarSection aria-label="toolbar-results">
                    <ToolbarGroup>
                        <ToolbarItem>
                            { rules.count === undefined && ('Loading...') }
                            { rules.count !== undefined && `${rules.count} result${rules.count !== 1 ? 's' : ''}` }
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarSection>
            </Toolbar>
        );
    }
}

Filters.propTypes = {
    children: PropTypes.any,
    externalFilters: PropTypes.object,
    fetchRules: PropTypes.func,
    match: PropTypes.object,
    rules: PropTypes.object,
    searchPlaceholder: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    filters: state.AdvisorStore.filters,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchRules: (url) => AppActions.fetchRules(url),
    setFilters: (filters) => AppActions.setFilters(filters)
}, dispatch);

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Filters));
