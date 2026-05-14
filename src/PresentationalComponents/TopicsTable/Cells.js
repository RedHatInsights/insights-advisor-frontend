import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import { StarIcon } from '@patternfly/react-icons';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import messages from '../../Messages';

/**
 * Renders topic name as a clickable link to the topic detail page
 */
export const Name = ({ name, slug }) => (
  <Link to={`/topics/${slug}`}>{name}</Link>
);

Name.propTypes = {
  name: PropTypes.string,
  slug: PropTypes.string,
};

/**
 * Renders a featured badge if the topic is marked as featured
 */
export const Featured = ({ featured, intl }) => {
  return featured ? (
    <Label className="pf-m-compact" color="blue" icon={<StarIcon />}>
      {intl.formatMessage(messages.featured)}
    </Label>
  ) : null;
};

Featured.propTypes = {
  featured: PropTypes.bool,
  intl: PropTypes.object,
};

/**
 * Renders the count of affected systems as a clickable link to the topic detail page
 */
export const AffectedSystems = ({ impacted_systems_count, slug }) => (
  <span className="pf-m-center">
    <Link to={`/topics/${slug}`}>{impacted_systems_count}</Link>
  </span>
);

AffectedSystems.propTypes = {
  impacted_systems_count: PropTypes.number,
  slug: PropTypes.string,
};
