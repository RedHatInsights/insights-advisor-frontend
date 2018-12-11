import React, { Component } from 'react';
import { Dropdown, DropdownItem } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import './_dropdownSort.scss';

class DropdownSort extends Component {
    constructor (props) {
        super(props);
        this.state = {
            isCollapsed: true
        };
        this.onSelect = this.onSelect.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    onSelect(event) {
        event.stopPropagation();
        event.preventDefault();
        const selectedValue = event.target.getAttribute('value');
        const seperator = '-';

        switch (this.props.title) {
            case 'Name' :
                this.props.updateSort({ sortBy: `name${seperator}${selectedValue}` });
                break;
            case 'Sort by Total Risk' :
                this.props.updateSort({ sortBy: `totalRisk${seperator}${selectedValue}` });
                break;
        }

        this.setState({ isCollapsed: true });
    }

    onToggle(_event, collapsed) {
        this.setState({ isCollapsed: collapsed });
    }

    render() {
        const { dropdownItems, dropdownValues } = this.props;

        return (
            <Dropdown
                className={ this.props.className }
                isCollapsed={ this.state.isCollapsed }
                onSelect={ this.onSelect }
                onToggle={ this.onToggle }
                title={ this.props.title }
            >
                { dropdownItems.map((item, key) => (
                    <DropdownItem key={ key } value={ dropdownValues[key] }>{ item }</DropdownItem>
                )) }
            </Dropdown>
        );
    }
}

DropdownSort.propTypes = {
    className: PropTypes.string,
    dropdownItems: PropTypes.array,
    dropdownValues: PropTypes.array,
    title: PropTypes.string,
    updateFilters: PropTypes.func,
    updateSort: PropTypes.func
};

export default DropdownSort;
