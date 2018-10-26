import React, { Component } from 'react';
import { Dropdown, DropdownItem } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import './_dropdownSort.scss';

class DropdownSort extends Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed: true
        };
        this.onSelect = this.onSelect.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.decapitalizeFirstLetter = this.decapitalizeFirstLetter.bind(this);
    }

    decapitalizeFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    onSelect(event) {
        const selected = event.target.getAttribute('value');

        switch (this.props.title) {
            case 'Name' :
                this.props.updateFilters({ name: selected }, 'name', selected);
                break;
            case 'Sort by Total Risk' :
                this.props.updateFilters({ totalRisk: selected }, 'totalRisk', selected); // eslint-disable-line camelcase
                break;
        }

        this.setState({
            collapsed: !this.state.collapsed
        });
        return false;
    }

    onToggle() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        const { dropdownItems, dropdownValues } = this.props;

        return (
            <Dropdown
                className={ this.props.className }
                isCollapsed={ this.state.collapsed }
                onToggle={ this.onToggle }
                onSelect={ this.onSelect }
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
    updateFilters: PropTypes.func
};

export default DropdownSort;
