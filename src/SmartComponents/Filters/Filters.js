import React, { Component } from 'react';
import { Grid, GridItem, TextInput } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { SEVERITY_MAP } from '../../AppConstants';
import './_filters.scss';

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

    applyFilters (filters) {
        this.props.fetchRules({ page: this.state.page, page_size: this.state.itemsPerPage, ...filters }); // eslint-disable-line camelcase
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
        const { rules } = this.props;
        const { text } = this.state.filters.text;

        return (
            <Grid className='advisorFilters' gutter={ 'md' }>
                <GridItem span={ 4 }>
                    <TextInput aria-label='Search' onChange={ this.changeFilterValue } type='search' value={ text } />
                </GridItem>
                <GridItem span={ 6 } >
                    { this.props.children }
                </GridItem>                <GridItem className='results' span={ 2 }>
                    { rules.count === undefined && (<Loading/>) }
                    { rules.count !== undefined && `${rules.count} result${rules.count !== 1 ? 's' : ''}` }
                </GridItem>
            </Grid>
        );
    }
}

Filters.propTypes = {
    fetchRules: PropTypes.func,
    history: PropTypes.object,
    itemsPerPage: PropTypes.number,
    match: PropTypes.object,
    page: PropTypes.number,
    rules: PropTypes.object,
    children: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchRules: (url) => AppActions.fetchRules(url)
}, dispatch);

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Filters));
