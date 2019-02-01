import React, { Component } from 'react';
import { Dropdown, DropdownToggle } from '@patternfly/react-core';
import CheckboxFilter from './CheckboxFilter.js';
import PropTypes from 'prop-types';
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
        const { isOpen } = this.state;
        const filterData = [
            {
                title: 'Total Risk', urlParam: 'total_risk', values: [
                    { label: 'Is an incident', value: '4' },
                    { label: 'Critical', value: '3' },
                    { label: 'High', value: '2' },
                    { label: 'Medium', value: '1' }
                ]
            },
            {
                title: 'Impact', urlParam: 'impact', values: [
                    { label: 'Critical', value: '4' },
                    { label: 'High', value: '3' },
                    { label: 'Medium', value: '2' },
                    { label: 'Low', value: '1' }
                ]
            },
            {
                title: 'Likelihood', urlParam: 'likelihood', values: [
                    { label: 'Critical', value: '4' },
                    { label: 'High', value: '3' },
                    { label: 'Medium', value: '2' },
                    { label: 'Low', value: '1' }
                ]
            },
            {
                title: 'Category', urlParam: 'category', values: [
                    { label: 'Availability', value: 'availability' },
                    { label: 'Performance', value: 'performance' },
                    { label: 'Stability', value: 'stability' }
                ]
            }
        ];

        return (
            <Dropdown
                onSelect={ this.onSelect }
                toggle={ <DropdownToggle onToggle={ this.onToggle }>Filters</DropdownToggle> }
                isOpen={ isOpen }
            >
                <div>
                    { filterData.map((data, index) =>
                        <div key={ `${data.urlParam}${index}` } className='filterTitle'>
                            { data.title }
                            { (data.values.map((item, key) => (
                                <CheckboxFilter
                                    key={ `check${index}${key}` }
                                    aria-label={ item.label }
                                    id={ `${data.urlParam}${key}` }
                                    label={ item.label }
                                    addRemoveFilters={ this.addRemoveFilters }
                                    paramName={ data.urlParam }
                                    value={ item.value }
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
    removeFilter: PropTypes.func
};

export default DropdownFilters;
