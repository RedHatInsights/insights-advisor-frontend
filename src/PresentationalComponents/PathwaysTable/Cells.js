import React from 'react';
import PropTypes from 'prop-types';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import CategoryLabel from '../Labels/CategoryLabel';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';

export const Name = ({ name, slug, has_incident }) => (
  <span>
    <Link to={`/recommendations/pathways/${slug}`}>{name}</Link>
    {has_incident && <RuleLabels rule={{ tags: 'incident' }} isCompact />}
  </span>
);

Name.propTypes = {
  name: PropTypes.string,
  slug: PropTypes.string,
  has_incident: PropTypes.bool,
};

export const Category = ({ categories }) => (
  <CategoryLabel labelList={categories} isCompact />
);

Category.propTypes = {
  categories: PropTypes.array,
};

export const Systems = ({ impacted_systems_count, slug }) => (
  <Link to={`/recommendations/pathways/${slug}`}>
    {impacted_systems_count.toLocaleString()}
  </Link>
);

Systems.propTypes = {
  impacted_systems_count: PropTypes.number,
  slug: PropTypes.string,
};

export const Reboot = ({ reboot_required }) =>
  reboot_required ? 'Required' : 'Not required';

Reboot.propTypes = {
  reboot_required: PropTypes.bool,
};

export const RecommendationLevelCell = ({ recommendation_level }) => (
  <RecommendationLevel recLvl={recommendation_level} />
);

RecommendationLevelCell.propTypes = {
  recommendation_level: PropTypes.number,
};
