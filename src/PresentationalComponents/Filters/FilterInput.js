import React, { Component } from 'react';
import { Checkbox, Radio } from '@patternfly/react-core';
import PropTypes from 'prop-types';

class FilterInput extends Component {
    state = {
        checked: false
    };

    componentDidMount() {
        const { type, filters, param, value } = this.props;
        switch (type) {
            case 'checkbox':
                param in filters && filters[param].includes(value) ? this.setState({ checked: true }) : this.setState({ checked: false });
                break;
        }
    }

    handleChange = checked => {
        const { type, addRemoveFilters, param, value } = this.props;
        let updateState;
        switch (type) {
            case 'checkbox':
                updateState = { checked: !this.state.checked };
                break;
        }

        this.setState({ ...updateState });
        addRemoveFilters(
            value,
            param,
            type,
            checked
        );
    };

    render () {
        const { label, id, param, value, type, filters } = this.props;
        const { checked } = this.state;

        return (() => {
            switch (type) {
                case 'checkbox':
                    return <Checkbox
                        aria-label={ label }
                        id={ id }
                        isChecked={ checked }
                        label={ label }
                        onChange={ this.handleChange }
                        param={ param }
                        value={ value }
                    />;
                case 'radio':
                    return <Radio
                        isChecked={ filters[param] === value }
                        aria-label={ label }
                        id={ id }
                        label={ label }
                        name={ param }
                        onChange={ this.handleChange }
                        param={ param }
                        value={ value }
                    />;
            }
        })();
    }

}

FilterInput.propTypes = {
    addRemoveFilters: PropTypes.func,
    className: PropTypes.string,
    currentPage: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    param: PropTypes.string,
    value: PropTypes.string,
    filters: PropTypes.object,
    type: PropTypes.string
};

export default FilterInput;

