import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import { StarIcon, TimesCircleIcon } from '@patternfly/react-icons';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import MessageState from '../MessageState/MessageState';
import { StaticTableToolsTable } from 'bastilian-tabletools';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useIntl } from 'react-intl';
import messages from '../../Messages';

/**
 * Renders topic name as a link to the topic detail page
 */
const NameCell = ({ name, slug }) => <Link to={`/topics/${slug}`}>{name}</Link>;

NameCell.propTypes = {
  name: PropTypes.string,
  slug: PropTypes.string,
};

/**
 * Renders featured badge if topic is featured
 */
const FeaturedCell = ({ featured }) => {
  const intl = useIntl();
  return featured ? (
    <Label className="pf-m-compact" color="blue" icon={<StarIcon />}>
      {intl.formatMessage(messages.featured)}
    </Label>
  ) : null;
};

FeaturedCell.propTypes = {
  featured: PropTypes.bool,
};

/**
 * Renders affected systems count as a link to the topic detail page
 */
const AffectedSystemsCell = ({ impacted_systems_count, slug }) => (
  <span className="pf-m-center">
    <Link to={`/topics/${slug}`}>{impacted_systems_count}</Link>
  </span>
);

AffectedSystemsCell.propTypes = {
  impacted_systems_count: PropTypes.number,
  slug: PropTypes.string,
};

/**
 * Topics table using bastilian-tabletools with client-side sorting and filtering.
 * Displays list of topics with name, featured status, and affected systems count.
 */
const TopicsTableNew = ({ props }) => {
  const intl = useIntl();
  const { data: topics = [], isLoading, isFetching, isError } = props;

  const columns = [
    {
      title: intl.formatMessage(messages.name),
      Component: NameCell,
      sortable: 'name',
      props: { colSpan: 2 },
    },
    {
      title: intl.formatMessage(messages.featured),
      Component: FeaturedCell,
      sortable: 'featured',
    },
    {
      title: intl.formatMessage(messages.affectedSystems),
      Component: AffectedSystemsCell,
      sortable: 'impacted_systems_count',
    },
  ];

  const filters = [
    {
      type: 'text',
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterAttribute: 'name',
    },
  ];

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
