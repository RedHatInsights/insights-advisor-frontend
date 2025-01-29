import React, { useEffect, useState } from 'react';
import { sortable, wrappable } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';

import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { sortTopics } from '../helper';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import { SkeletonTable } from '@patternfly/react-component-groups';

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
                      <Link key={key} to={`/topics/${value.slug}`}>
                        {' '}
                        {value.impacted_systems_count}
                      </Link>
                    </span>
                  ),
                },
              ],
            },
          ]
        : [];
    });

  const onSort = (_event, index, direction) => {
    setSort({ index, direction });
    setRows(buildRows(sortTopics(topics, index, direction)));
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
      type: conditionalFilterType.text,
      filterValues: {
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
        <>
          <PrimaryToolbar
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
          />
          <SkeletonTable columns={cols.map((c) => c.title)} />
        </>
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
