import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import { StarIcon } from '@patternfly/react-icons';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import { useIntl } from 'react-intl';
import messages from '../../Messages';

/**
 * Cell Components
 */

/**
 * Renders topic name as a clickable link to the topic detail page
 * @param {object} props - Component props
 * @param {string} props.name - Topic name to display
 * @param {string} props.slug - Topic slug for URL routing
 * @returns {JSX.Element} Link component with topic name
 */
export const NameCell = ({ name, slug }) => (
  <Link to={`/topics/${slug}`}>{name}</Link>
);

NameCell.propTypes = {
  name: PropTypes.string,
  slug: PropTypes.string,
};

/**
 * Renders a featured badge if the topic is marked as featured
 * @param {object} props - Component props
 * @param {boolean} props.featured - Whether the topic is featured
 * @param {object} props.intl - react-intl instance for message formatting
 * @returns {JSX.Element|null} Featured label or null if not featured
 */
export const FeaturedCell = ({ featured, intl }) => {
  return featured ? (
    <Label className="pf-m-compact" color="blue" icon={<StarIcon />}>
      {intl.formatMessage(messages.featured)}
    </Label>
  ) : null;
};

FeaturedCell.propTypes = {
  featured: PropTypes.bool,
  intl: PropTypes.object,
};

/**
 * Renders the count of affected systems as a clickable link to the topic detail page
 * @param {object} props - Component props
 * @param {number} props.impacted_systems_count - Number of systems affected by this topic
 * @param {string} props.slug - Topic slug for URL routing
 * @returns {JSX.Element} Centered span with link to topic detail
 */
export const AffectedSystemsCell = ({ impacted_systems_count, slug }) => (
  <span className="pf-m-center">
    <Link to={`/topics/${slug}`}>{impacted_systems_count}</Link>
  </span>
);

AffectedSystemsCell.propTypes = {
  impacted_systems_count: PropTypes.number,
  slug: PropTypes.string,
};

/**
 * Hook to get column definitions for TopicsTable
 * Uses memoization to prevent recreating columns on every render
 * @returns {Array<object>} Array of column configuration objects
 * @property {string} title - Translated column header text
 * @property {React.Component} Component - Cell renderer component
 * @property {string} sortable - Field name for sorting
 * @property {object} [props] - Additional props for the column (e.g., colSpan)
 */
export const useTopicsColumns = () => {
  const intl = useIntl();

  return useMemo(
    () => [
      {
        title: intl.formatMessage(messages.name),
        Component: NameCell,
        sortable: 'name',
        props: { colSpan: 2 },
      },
      {
        title: intl.formatMessage(messages.featured),
        Component: (props) => <FeaturedCell {...props} intl={intl} />,
        sortable: 'featured',
      },
      {
        title: intl.formatMessage(messages.affectedSystems),
        Component: AffectedSystemsCell,
        sortable: 'impacted_systems_count',
      },
    ],
    [intl],
  );
};

/**
 * Hook to get filter configuration for TopicsTable
 * Uses memoization to prevent recreating filters on every render
 * @returns {Array<object>} Array of filter configuration objects
 * @property {string} type - Filter type (e.g., 'text', 'checkbox')
 * @property {string} label - Translated filter label
 * @property {string} filterAttribute - Field name to filter on
 */
export const useTopicsFilters = () => {
  const intl = useIntl();

  return useMemo(
    () => [
      {
        type: 'text',
        label: intl.formatMessage(messages.name).toLowerCase(),
        filterAttribute: 'name',
      },
    ],
    [intl],
  );
};
