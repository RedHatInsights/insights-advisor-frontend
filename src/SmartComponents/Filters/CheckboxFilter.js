import React, { Component } from 'react';
import { Checkbox } from '@patternfly/react-core';
import PropTypes from 'prop-types';

class CheckboxFilter extends Component {
    state = {
        checked: false
    };

    handleChange = checked => {
        this.setState({ checked: !this.state.checked });
        this.props.addRemoveFilters(
            event.target.value,
            event.target.getAttribute('paramName'),
            checked
        );
    };

    render () {
        return (
            <Checkbox
                key={ this.props.key }
                aria-label={ this.props.label }
                id={ this.props.id }
                isChecked={ this.state.checked }
                label={ this.props.label }
                onChange={ this.handleChange }
                paramName={ this.props.paramName }
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
    paramName: PropTypes.string,
    value: PropTypes.string,
    key: PropTypes.string
};

CheckboxFilter.defaultProps = {
    checked: false
};

export default CheckboxFilter;

