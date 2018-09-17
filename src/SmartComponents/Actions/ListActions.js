import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './_actions.scss';
import PropTypes from 'prop-types';

import {
    PageHeader,
    PageHeaderTitle,
    Battery,
    Ansible,
    Table,
    SortDirection,
    Pagination,
    Main
} from '@red-hat-insights/insights-frontend-components';

import {
    Grid,
    GridItem,
    Title
} from '@patternfly/react-core';

import { sortBy } from 'lodash';

import TimeAgo from 'react-timeago';

import mockData from '../../../mockData/medium-risk.json';
import impactedSystemsData from '../../../mockData/actions-types-ids_impacted-systems.json';

class ListActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: [ 'Type', 'Name', 'Reported' ],
            rows: [],
            rule: {},
            sortBy: {},
            itemsPerPage: 10,
            page: 1
        };
        this.onSortChange = this.onSortChange.bind(this);
        this.toggleCol = this.toggleCol.bind(this);
        this.limitRows = this.limitRows.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setPerPage = this.setPerPage.bind(this);
        this.parseProductCode = this.parseProductCode.bind(this);
    }

    componentDidMount() {
        const response = JSON.parse(JSON.stringify(mockData));

        let rule = response.rules.find(obj => {
            return obj.rule_id === this.props.match.params.id;
        });
        this.setState({ rule });

        const response2 = JSON.parse(JSON.stringify(impactedSystemsData));
        let rows = [];
        for (let i = 0;i < response2.resources.length;i++) {
            rows.push(
                { cells: [
                    this.parseProductCode(response2.resources[i].product_code),
                    (response2.resources[i].hostname === '' ? response2.resources[i].system_id : response2.resources[i].hostname),
                    <TimeAgo key={ i } date={ response2.resources[i].created_at }/>
                ]}
            );
        }

        this.setState({ rows });
    }

    parseProductCode(productCode) {
        let productName = '';
        switch (productCode) {
            case 'rhel':
                productName = 'RHEL Server';
                break;
            default:
                productName = 'Undefined';
        }

        return productName;
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
        const sortedRows = sortBy(this.state.rows, [ e => e.cells[key] ]);
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
                    <PageHeaderTitle title= 'Actions' />
                </PageHeader>
                <Main className='actions__list'>
                    <Grid gutter='md'>
                        <GridItem md={ 8 } sm={ 12 }>
                            <Title size='xl'>
                                { this.state.rule.description }
                            </Title>
                            <div className='actions__description' dangerouslySetInnerHTML={ { __html: this.state.rule.summary_html } }/>
                        </GridItem>
                        <GridItem md={ 4 } sm={ 12 }>
                            <Grid gutter='sm' className='actions__detail'>
                                <GridItem sm={ 12 } md={ 12 }> <Ansible unsupported = { this.state.rule.ansible }/> </GridItem>
                                <GridItem sm={ 8 } md={ 12 }>
                                    <Grid className='ins-l-icon-group__vertical' sm={ 4 } md={ 12 }>
                                        <GridItem> <Battery label='Impact' severity={ this.state.rule.rec_impact }/> </GridItem>
                                        <GridItem> <Battery label='Likelihood' severity={ this.state.rule.rec_likelihood }/> </GridItem>
                                        <GridItem> <Battery label='Total Risk' severity={ this.state.rule.resolution_risk }/> </GridItem>
                                    </Grid>
                                </GridItem>
                                <GridItem sm={ 4 } md={ 12 }>
                                    <Battery label='Risk Of Change' severity={ 3 }/>
                                </GridItem>
                            </Grid>
                        </GridItem>
                    </Grid>
                    <Table
                        className='impacted-systems-table'
                        onItemSelect={ this.toggleCol }
                        hasCheckbox={ true }
                        header={ this.state.cols }
                        sortBy={ this.state.sortBy }
                        rows={ rows }
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
                </Main>
            </React.Fragment>
        );
    }
};

ListActions.propTypes = {
    match: PropTypes.any
};

export default withRouter(ListActions);
