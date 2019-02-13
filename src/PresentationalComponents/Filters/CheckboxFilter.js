import React, { Component } from 'react';
import { Checkbox } from '@patternfly/react-core';
import PropTypes from 'prop-types';

class CheckboxFilter extends Component {
    state = {
        checked: false
    };

    componentDidMount () {
        this.props.filters[this.props.param] && this.props.filters[this.props.param].includes(this.props.value) ?
            this.setState({ checked: true }) :
            this.setState({ checked: false });
    }

    handleChange = checked => {
        this.setState({ checked: !this.state.checked });
        this.props.addRemoveFilters(
            event.target.value,
            event.target.getAttribute('param'),
            checked
        );
    };

    render () {
        return (
            <Checkbox
                aria-label={ this.props.label }
                id={ this.props.id }
                isChecked={ this.state.checked }
                label={ this.props.label }
                onChange={ this.handleChange }
                param={ this.props.param }
                value={ this.props.value }
            />
        );
    }
}

CheckboxFilter.propTypes = {
    addRemoveFilters: PropTypes.func,
    className: PropTypes.string,
    currentPage: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    param: PropTypes.string,
    value: PropTypes.string,
    filters: PropTypes.object
};

export default CheckboxFilter;

