import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../../App.scss';
import './_actions.scss';
import PropTypes from 'prop-types';

import { sortBy } from 'lodash';
import {
    Ansible,
    Battery,
    PageHeader,
    PageHeaderTitle,
    Pagination,
    Section,
    SortDirection,
    Table
} from '@red-hat-insights/insights-frontend-components';
import '~@red-hat-insights/insights-frontend-components/Utilities/_all';
import mockData from '../../../mockData/medium-risk.json';

document.getElementById('root').classList.add('actions__view');
const response = JSON.parse(JSON.stringify(mockData));
let rowLinks = [];

class ViewActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            summary: '',
            cols: ['Rule', 'Likelihood', 'Impact', 'Total Risk', 'Systems', 'Ansible'],
            rows: [],
            sortBy: {},
            itemsPerPage: 10,
            page: 1,
            things: []
        };
        this.onSortChange = this.onSortChange.bind(this);
        this.toggleCol = this.toggleCol.bind(this);
        this.limitRows = this.limitRows.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setPerPage = this.setPerPage.bind(this);
        this.rowClickHandler = this.rowClickHandler.bind(this);
    }

    componentDidMount() {
        this.setState({ summary: response.summary });

        let cells = [];
        for (let i = 0;i < response.rules.length;i++) {
            rowLinks.push(response.rules[i].rule_id);
            cells.push(
                { cells: [
                    <div key={ i }>{ response.rules[i].description }</div>,
                    <Section key={ i } type='icon-group'>
                        <Battery label='Likelihood' labelHidden severity={ response.rules[i].rec_likelihood } />
                    </Section>,
                    <Section key={ i } type='icon-group'>
                        <Battery label='Impact' labelHidden severity={ response.rules[i].rec_impact } />
                    </Section>,
                    <Section key={ i } type='icon-group'>
                        <Battery label='Total Risk' labelHidden severity={ response.rules[i].resolution_risk } />
                    </Section>,
                    <div key={ i }>{ response.rules[i].hitCount }</div>,
                    <Ansible key={ i } unsupported={ response.rules[i].ansible === 1 ? true : false } />
                ] }
            );
        }

        this.setState({ rows: cells });
    }

    rowClickHandler(_event, key) {
        // console.log('/insights/platform/advisor/actions/medium/' + rowLinks[key]);
        return false;
    }

    toggleCol(_event, key, selected) {
        let { rows, page, itemsPerPage } = this.state;
        const firstIndex = page === 1 ? 0 : page * itemsPerPage - itemsPerPage;
        rows[firstIndex + key].selected = selected;
        this.setState({
            ...this.state,
            rows
        });
    }

    onSortChange(_event, key, direction) {
        const sortedRows = sortBy(this.state.rows, [e => e.cells[key]]);
        this.setState({
            ...this.state,
            rows: SortDirection.up === direction ? sortedRows : sortedRows.reverse(),
            sortBy: {
                index: key,
                direction
            }
        });
    }

    limitRows() {
        const { page, itemsPerPage } = this.state;
        const numberOfItems = this.state.rows.length;
        const lastPage = Math.ceil(numberOfItems / itemsPerPage);
        const lastIndex = page === lastPage ? numberOfItems : page * itemsPerPage;
        const firstIndex = page === 1 ? 0 : page * itemsPerPage - itemsPerPage;
        return this.state.rows.slice(firstIndex, lastIndex);
    }

    setPage(page) {
        this.setState({
            ...this.state,
            page
        });
    }

    setPerPage(amount) {
        this.setState({
            ...this.state,
            itemsPerPage: amount
        });
    }

    render() {
        const rows = this.limitRows();
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title={ `${this.props.match.params.type} Risk Actions` } />
                </PageHeader>
                <Section type='content'>
                    <p>{ this.state.summary }</p>
                </Section>
                <Section type='content'>
                    Filters
                </Section>
                <Section type='content'>
                    <Table
                        className='rules-table'
                        onItemSelect={ this.toggleCol }
                        hasCheckbox={ false }
                        header={ this.state.cols }
                        sortBy={ this.state.sortBy }
                        rows={ rows }
                        onRowClick={ this.rowClickHandler }
                        onSort={ this.onSortChange }
                        footer={
                            <Pagination
                                numberOfItems={ this.state.rows.length }
                                onPerPageSelect={ this.setPerPage }
                                page={ this.state.page }
                                onSetPage={ this.setPage }
                                itemsPerPage={ this.state.itemsPerPage }
                            />
                        }
                    />
                </Section>
            </React.Fragment>
        );
    };

};

ViewActions.propTypes = {
    match: PropTypes.any
};

export default withRouter(ViewActions);
