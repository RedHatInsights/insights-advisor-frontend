import React from 'react';
import PropTypes from 'prop-types';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import CategoryLabel from '../Labels/CategoryLabel';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';
import messages from '../../Messages';

/**
 * Renders pathway name as a clickable link with optional incident label
 */
export const Name = ({ name, slug, has_incident, intl }) => (
  <span>
    <Link to={`/recommendations/pathways/${slug}`}>{name}</Link>
    {has_incident && (
      <RuleLabels rule={{ tags: 'incident' }} intl={intl} isCompact />
    )}
  </span>
);

Name.propTypes = {
  name: PropTypes.string,
  slug: PropTypes.string,
  has_incident: PropTypes.bool,
  intl: PropTypes.object,
};

/**
 * Renders category labels for a pathway
 */
export const Category = ({ categories }) => (
  <CategoryLabel labelList={categories} isCompact />
);

Category.propTypes = {
  categories: PropTypes.array,
};

/**
 * Renders the count of impacted systems as a clickable link
 */
export const Systems = ({ impacted_systems_count, slug }) => (
  <Link to={`/recommendations/pathways/${slug}`}>
    {impacted_systems_count.toLocaleString()}
  </Link>
);

Systems.propTypes = {
  impacted_systems_count: PropTypes.number,
  slug: PropTypes.string,
};

/**
 * Renders reboot required status
 */
export const Reboot = ({ reboot_required, intl }) =>
  intl.formatMessage(
    reboot_required ? messages.required : messages.notRequired,
  );

Reboot.propTypes = {
  reboot_required: PropTypes.bool,
  intl: PropTypes.object,
};

/**
 * Renders recommendation level badge
 */
export const RecommendationLevelCell = ({ recommendation_level }) => (
  <RecommendationLevel recLvl={recommendation_level} />
);

RecommendationLevelCell.propTypes = {
  recommendation_level: PropTypes.number,
};
