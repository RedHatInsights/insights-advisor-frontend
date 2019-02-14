import React, { Component } from 'react';
import { Dropdown, DropdownToggle } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import CheckboxFilter from './CheckboxFilter.js';
import { FILTER_CATEGORIES } from '../../AppConstants';
import './_dropdown.scss';

class DropdownFilters extends Component {
    state = {
        isOpen: false
    };

    addRemoveFilters = (selectedValue, filterName, isChecked) => {
        isChecked ? this.props.addFilter(filterName, selectedValue) : this.props.removeFilter(filterName, selectedValue);
    };

    onToggle = isOpen => {
        this.setState({
            isOpen
        });
    };

    render () {
        const { hideCategories, filters } = this.props;
        const { isOpen } = this.state;

        return (
            <Dropdown
                onSelect={ this.onSelect }
                toggle={ <DropdownToggle onToggle={ this.onToggle }>Filters</DropdownToggle> }
                isOpen={ isOpen }
            >
                <div>
                    { FILTER_CATEGORIES.map((data, index) =>
                        !hideCategories.includes(data.urlParam) &&
                        <div key={ `${data.urlParam}${index}` } className='filterTitle'>
                            { data.title }
                            { (data.values.map((item, key) => (
                                <CheckboxFilter
                                    key={ `check${index}${key}` }
                                    aria-label={ item.label }
                                    id={ `${data.urlParam}${key}` }
                                    label={ item.label }
                                    addRemoveFilters={ this.addRemoveFilters }
                                    param={ data.urlParam }
                                    value={ item.value }
                                    filters={ filters }
                                />
                            ))) }
                            { (index !== 3 && <br/>) }
                        </div>) }
                </div>
            </Dropdown>
        );
    }
}

DropdownFilters.propTypes = {
    addFilter: PropTypes.func,
    removeFilter: PropTypes.func,
    hideCategories: PropTypes.array,
    filters: PropTypes.object
};

DropdownFilters.defaultProps = {
    hideCategories: []
};

export default DropdownFilters;
