import React, { Component } from 'react';
import { Input } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';

class Search extends Component {
    constructor (props) {
        super(props);
        this.state = {
            value: ''
        };

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount () {
        document.getElementById('advisorSearch').focus();
    }

    onChange (event) {
        this.props.updateFilters({ search: event.target.value });
        return false;
    }

    render () {

        return (
            <Input
                className={ this.props.className }
                id='advisorSearch'
                onChange={ this.onChange }
                placeholder={ this.props.placeholder }
                type='text'
                value={ this.props.searchTerm || '' }
            />
        );
    }
}
Search.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    searchTerm: PropTypes.string,
    updateFilters: PropTypes.func
};

export default Search;
