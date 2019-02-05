import React, { Component } from 'react';
import { Checkbox } from '@patternfly/react-core';
import PropTypes from 'prop-types';

class CheckboxFilter extends Component {
    state = {
        checked: false
    };

    handleChange (event) {
        this.setState({ checked: !this.state.checked });
        this.props.addRemoveFilters(
            event.target.getAttribute('value'),
            event.target.getAttribute('paramName'),
            this.state.checked
        );
    }

    render() {
        return (
            <Checkbox
                aria-label={ this.props.label }
                id={ this.props.id }
                isChecked={ this.state.checked }
                label={ this.props.label }
                onChange={ this.handleChange }
                paramname={ this.props.paramname }
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
    paramname: PropTypes.string,
    value: PropTypes.string
};

export default CheckboxFilter;
