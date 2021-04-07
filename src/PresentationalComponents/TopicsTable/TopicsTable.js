import React, { useEffect, useState } from 'react';
import { SortByDirection, Table, TableBody, TableHeader, sortable, wrappable } from '@patternfly/react-table';

import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import { Link } from 'react-router-dom';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import StarIcon from '@patternfly/react-icons/dist/js/icons/star-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import messages from '../../Messages';
import { sortBy } from 'lodash';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

const TopicsTable = () => {
    const intl = useIntl();
    const topics = useSelector(({ AdvisorStore }) => AdvisorStore.topics);
    const topicsFetchStatus = useSelector(({ AdvisorStore }) => AdvisorStore.topicsFetchStatus);
    const [searchText, setSearchText] = useState('');
    const [cols] = useState([
        { title: intl.formatMessage(messages.name), transforms: [sortable] },
        '',
        { title: intl.formatMessage(messages.featured), transforms: [sortable, wrappable] },
        { title: intl.formatMessage(messages.affectedSystems), transforms: [sortable, wrappable] }
    ]);
    const [rows, setRows] = useState([]);
    const [sort, setSort] = useState({ index: 2, direction: 'desc' });

    const buildRows = (list) => list.flatMap((value, key) => {
        const isValidSearchText = searchText.length === 0 || value.name.toLowerCase().includes(searchText.toLowerCase());

        return isValidSearchText ? [{
            topic: value,
            cells: [{
                title: <span key={key}><Link key={key} to={`/topics/${value.slug}`}> {value.name} </Link></span>,
                props: { colSpan: 2 }
            }, {
                title: <span key={key}> {value.featured &&
                    <Label color='blue' icon={<StarIcon />}>{intl.formatMessage(messages.featured)}</Label>
                } </span>
            }, {
                title: <span className='pf-m-center' key={key}> {value.impacted_systems_count}</span>
            }]
        }] : [];
    });

    const onSort = (_event, index, direction) => {
        const sortedReports = {
            0: sortBy(topics, [result => result.name]),
            2: sortBy(topics, [result => result.featured]),
            3: sortBy(topics, [result => result.impacted_systems_count])
        };
        const sortedTopicsDirectional = direction === SortByDirection.asc ? sortedReports[index] : sortedReports[index].reverse();
        setSort({ index, direction });
        setRows(buildRows(sortedTopicsDirectional));
    };

    const activeFiltersConfig = {
        filters: searchText.length ? [{ category: 'Description', chips: [{ name: searchText, value: searchText }] }] : [],
        onDelete: () => { setSearchText(''); setSort({}); }
    };

    useEffect(() => {
        sort.index ? onSort(null, sort.index, sort.direction) : setRows(buildRows(topics).asMutable());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topics, searchText]);

    const filterConfigItems = [{
        label: intl.formatMessage(messages.name),
        filterValues: {
            key: 'text-filter',
            onChange: (event, value) => { setSearchText(value); setSort({}); },
            value: searchText
        }
    }];

    return <React.Fragment>
        {topicsFetchStatus === '' || topicsFetchStatus === 'pending' && <Loading />}
        {topicsFetchStatus === 'fulfilled' && topics.length > 0 &&
            <React.Fragment>
                <PrimaryToolbar
                    filterConfig={{ items: filterConfigItems }}
                    activeFiltersConfig={activeFiltersConfig}
                />
                <Table aria-label={'topics-table'} sortBy={sort} onSort={onSort} cells={cols} rows={rows}
                    ouiaId='topicTable' isStickyHeader>
                    <TableHeader />
                    <TableBody />
                    {rows.length === 0 && topicsFetchStatus !== 'pending' && setRows([{
                        cells: [{
                            title: (
                                <MessageState icon={SearchIcon}
                                    title={intl.formatMessage(messages.noHitsTitle, { item: intl.formatMessage(messages.topics).toLowerCase() })}
                                    text={intl.formatMessage(messages.noHitsBody, { item: intl.formatMessage(messages.topics).toLowerCase() })} />),
                            props: { colSpan: 4 }
                        }]
                    }])
                    }
                </Table>
            </React.Fragment>
        }
        {topicsFetchStatus === 'failed' || topicsFetchStatus === 'rejected' || (topicsFetchStatus === 'fulfilled' && topics.length === 0) &&
            < MessageState icon={TimesCircleIcon}
                title={intl.formatMessage(messages.topicsListNotopicsTitle)}
                text={intl.formatMessage(messages.topicsListNotopicsBody)} />
        }
    </React.Fragment>;
};

export default TopicsTable;

