import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  sortable,
  wrappable,
} from '@patternfly/react-table';

import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import { Link } from 'react-router-dom';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import StarIcon from '@patternfly/react-icons/dist/js/icons/star-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import messages from '../../Messages';
import { orderBy } from 'lodash';
import { useIntl } from 'react-intl';

const TopicsTable = ({ props }) => {
  const intl = useIntl();
  const [searchText, setSearchText] = useState('');
  const { data: topics, isLoading, isFetching, isError } = props;
  const [cols] = useState([
    { title: intl.formatMessage(messages.name), transforms: [sortable] },
    '',
    {
      title: intl.formatMessage(messages.featured),
      transforms: [sortable, wrappable],
    },
    {
      title: intl.formatMessage(messages.affectedSystems),
      transforms: [sortable, wrappable],
    },
  ]);
  const [rows, setRows] = useState([]);
  const [sort, setSort] = useState({ index: 2, direction: 'desc' });

  const buildRows = (list) =>
    list.flatMap((value, key) => {
      const isValidSearchText =
        searchText.length === 0 ||
        value.name.toLowerCase().includes(searchText.toLowerCase());

      return isValidSearchText
        ? [
            {
              topic: value,
              cells: [
                {
                  title: (
                    <span key={key}>
                      <Link key={key} to={`/topics/${value.slug}`}>
                        {' '}
                        {value.name}{' '}
                      </Link>
                    </span>
                  ),
                  props: { colSpan: 2 },
                },
                {
                  title: (
                    <span key={key}>
                      {' '}
                      {value.featured && (
                        <Label
                          className="pf-m-compact"
                          color="blue"
                          icon={<StarIcon />}
                        >
                          {intl.formatMessage(messages.featured)}
                        </Label>
                      )}{' '}
                    </span>
                  ),
                },
                {
                  title: (
                    <span className="pf-m-center" key={key}>
                      {' '}
                      {value.impacted_systems_count}
                    </span>
                  ),
                },
              ],
            },
          ]
        : [];
    });

  const onSort = (_event, index, direction) => {
    let sortingName = '';
    index === 0
      ? (sortingName = 'name')
      : index === 2
      ? (sortingName = 'featured')
      : (sortingName = 'impacted_systems_count');
    setSort({ index, direction });
    setRows(
      buildRows(orderBy(topics, [(result) => result[sortingName]], direction))
    );
  };

  const activeFiltersConfig = {
    filters: searchText.length
      ? [
          {
            category: 'Description',
            chips: [{ name: searchText, value: searchText }],
          },
        ]
      : [],
    onDelete: () => {
      setSearchText('');
      setSort({});
    },
  };

  useEffect(() => {
    sort.index
      ? onSort(null, sort.index, sort.direction)
      : setRows(buildRows(topics));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, searchText]);

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (event, value) => {
          setSearchText(value);
          setSort({});
        },
        value: searchText,
      },
    },
  ];

  return (
    <React.Fragment>
      {isLoading || isFetching ? (
        <Loading />
      ) : !isFetching && topics.length > 0 ? (
        <React.Fragment>
          <PrimaryToolbar
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
          />
          <Table
            aria-label={'topics-table'}
            sortBy={sort}
            onSort={onSort}
            cells={cols}
            rows={rows}
            ouiaId="topicTable"
            isStickyHeader
          >
            <TableHeader />
            <TableBody />
            {rows.length === 0 &&
              !isFetching &&
              setRows([
                {
                  cells: [
                    {
                      title: (
                        <MessageState
                          icon={SearchIcon}
                          title={intl.formatMessage(messages.noHitsTitle, {
                            item: intl
                              .formatMessage(messages.topics)
                              .toLowerCase(),
                          })}
                          text={intl.formatMessage(
                            messages.topicsListNoHitsBody
                          )}
                        />
                      ),
                      props: { colSpan: 4 },
                    },
                  ],
                },
              ])}
          </Table>
        </React.Fragment>
      ) : (
        isError && (
          <MessageState
            icon={TimesCircleIcon}
            title={intl.formatMessage(messages.topicsListNotopicsTitle)}
            text={intl.formatMessage(messages.topicsListNotopicsBody)}
          />
        )
      )}
    </React.Fragment>
  );
};

TopicsTable.propTypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
};

export default TopicsTable;
