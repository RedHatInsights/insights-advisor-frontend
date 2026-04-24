import React from 'react';
import PropTypes from 'prop-types';
import { TimesCircleIcon } from '@patternfly/react-icons';
import MessageState from '../MessageState/MessageState';
import { StaticTableToolsTable } from 'bastilian-tabletools';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import { useTopicsColumns, useTopicsFilters } from './TopicsTableAssets';

/**
 * Topics table using bastilian-tabletools with client-side sorting and filtering.
 * Displays list of topics with name, featured status, and affected systems count.
 */
const TopicsTableNew = ({ props }) => {
  const intl = useIntl();
  const { data: topics = [], isLoading, isFetching, isError } = props;

  const columns = useTopicsColumns();
  const filters = useTopicsFilters();

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
    return <SkeletonTable columns={columns.map((c) => c.title)} />;
  }

  return (
    <StaticTableToolsTable
      items={topics}
      columns={columns}
      filters={{ filterConfig: filters }}
      options={{
        pagination: false,
        defaultSort: {
          index: 1,
          direction: 'desc',
        },
      }}
    />
  );
};

TopicsTableNew.propTypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
};

export default TopicsTableNew;
