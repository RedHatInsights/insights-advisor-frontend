import React, { Component } from 'react';
import { Dropdown } from '@red-hat-insights/insights-frontend-components';
import CheckboxFilter from './CheckboxFilter.js';
import PropTypes from 'prop-types';
import './_dropdown.scss';

class DropdownFilters extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true
        };
        this.onToggle = this.onToggle.bind(this);
    }

    addRemoveFilters (selectedValue, filterName, isChecked) {
        isChecked ? this.addFilter(filterName, selectedValue) : this.removeFilter(filterName, selectedValue);
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    onToggle () {
        this.setState({ collapsed: !this.state.collapsed });
    };

    render () {
        const filterData = [
            { title: 'Total Risk', urlParam: 'total_risk', values: [
                { label: 'Is an incident', value: '4' },
                { label: 'Critical', value: '3' },
                { label: 'High', value: '2' },
                { label: 'Medium', value: '1' }
            ]},
            { title: 'Impact', urlParam: 'impact', values: [
                { label: 'Critical', value: '4' },
                { label: 'High', value: '3' },
                { label: 'Medium', value: '2' },
                { label: 'Low', value: '1' }
            ]},
            { title: 'Likelihood', urlParam: 'likelihood', values: [
                { label: 'Critical', value: '4' },
                { label: 'High', value: '3' },
                { label: 'Medium', value: '2' },
                { label: 'Low', value: '1' }
            ]},
            { title: 'Category', urlParam: 'category', values: [
                { label: 'Availability', value: 'availability' },
                { label: 'Performance', value: 'performance' },
                { label: 'Stability', value: 'stability' }
            ]}
        ];
        const dropdownItems = (title, paramname, items, index) => {
            let thisFilter = [];
            if (index !== 0) { thisFilter.push(<br />); }

            thisFilter.push(<div key={ `${paramname}${index}` } className='filterTitle'>{ title }</div>);
            items.forEach((item, key) => (
                thisFilter.push(<CheckboxFilter
                    key={ `check${index}${key}` }
                    aria-label={ item.label }
                    id={ `${paramname}${key}` }
                    label={ item.label }
                    addRemoveFilters={ this.addRemoveFilters }
                    paramname={ paramname }
                    value={ item.value }
                />)
            ));
            return thisFilter;
        };

        return (
            <Dropdown
                className={ this.props.className }
                isCollapsed={ this.state.collapsed }
                onToggle={ this.onToggle }
                title='Filters'
            >
                <div>
                    { filterData.map((data, index) => dropdownItems(data.title, data.urlParam, data.values, index)) }
                </div>
            </Dropdown>
        );
    }
}

DropdownFilters.propTypes = {
    addFilter: PropTypes.func,
    className: PropTypes.string,
    removeFilter: PropTypes.func
};

export default DropdownFilters;
