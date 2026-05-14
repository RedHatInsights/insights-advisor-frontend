import React from 'react';
import PropTypes from 'prop-types';
import { TimesCircleIcon } from '@patternfly/react-icons';
import MessageState from '../MessageState/MessageState';
import { StaticTableToolsTable } from 'bastilian-tabletools';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import columns from './Columns';
import filters from './Filters';

/**
 * Topics table component using bastilian-tabletools with client-side sorting and filtering.
 * Displays list of topics with name, featured status, and affected systems count.
 *
 * @param {object} props - Component props
 * @param {object} props.props - Nested props object containing table data and state
 * @param {Array} props.props.data - Array of topic objects
 * @param {boolean} props.props.isLoading - Whether initial data is loading
 * @param {boolean} props.props.isFetching - Whether data is being refetched
 * @param {boolean} props.props.isError - Whether an error occurred loading data
 * @returns {JSX.Element} Topics table component
 */
const TopicsTableNew = ({ props }) => {
  const intl = useIntl();
  // eslint-disable-next-line react/prop-types
  const { data: topics = [], isLoading, isFetching, isError } = props;

  const tableColumns = columns(intl);
  const tableFilters = filters(intl);

  if (isError) {
    return (
      <MessageState
        icon={TimesCircleIcon}
        title={intl.formatMessage(messages.topicsListNotopicsTitle)}
        text={intl.formatMessage(messages.topicsListNotopicsBody)}
      />
    );
  }

  if (isLoading || isFetching) {
    return <SkeletonTable columns={tableColumns.map((c) => c.title)} />;
  }

  return (
    <StaticTableToolsTable
      items={topics}
      columns={tableColumns}
      filters={{ filterConfig: tableFilters }}
      options={{
        pagination: false,
        sortBy: {
          index: 1,
          direction: 'desc',
        },
      }}
    />
  );
};

TopicsTableNew.propTypes = {
  props: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
  }).isRequired,
};

export default TopicsTableNew;
