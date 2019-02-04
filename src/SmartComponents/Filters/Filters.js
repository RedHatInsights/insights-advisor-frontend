import React, { Component } from 'react';
import { Grid, GridItem, TextInput } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { SEVERITY_MAP } from '../../AppConstants';

class Filters extends Component {
    state = {
        filters: {
            impacting: true,
            text: ''
        }
    };

    componentDidMount () {
        if (this.props.match.params.type !== undefined) {
            this.setType(this.props.match.params.type);
        }
    }

    setType(type) {
        if (type.includes('-risk')) {
            const severity = SEVERITY_MAP[type];
            this.setState({ filters: { ...this.state.filters, severity }});
        } else {
            this.setState({ filters: { ...this.state.filters, category: type }});
        }
    }

    apply = () => {
        this.props.fetchRules({ page: this.state.page, page_size: this.state.itemsPerPage, ...this.state.filters }); // eslint-disable-line camelcase
    };

    changeFilterValue = debounce(
        value =>
            this.setState(
                {
                    filters: { ...this.state.filters, text: value }
                },
                this.apply
            ),
        800
    );

    render () {
        const { text } = this.state.filters.text;

        return (
            <Grid>
                <GridItem>
                    <TextInput aria-label='Search' id='search' onChange={ this.changeFilterValue } placeholder='Find a rule' type='search' value={ text } />
                </GridItem>
            </Grid>
        );
    }
}

Filters.propTypes = {
    fetchRules: PropTypes.func,
    itemsPerPage: PropTypes.number,
    match: PropTypes.object,
    page: PropTypes.number
};

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchRules: (url) => AppActions.fetchRules(url)
}, dispatch);

export default routerParams(connect(null, mapDispatchToProps)(Filters));
