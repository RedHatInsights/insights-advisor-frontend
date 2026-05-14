/**
 * Column definitions for PathwaysTable using bastilian-tabletools.
 * Each column factory function returns a configuration object with title, Component, and optional sortable/props.
 */
import React from 'react';
import {
  Name as NameCell,
  Category as CategoryCell,
  Systems as SystemsCell,
  Reboot as RebootCell,
  RecommendationLevelCell,
} from './Cells';
import messages from '../../Messages';

export const Name = (intl) => ({
  title: intl.formatMessage(messages.pathwaysName),
  Component: (props) => <NameCell {...props} intl={intl} />,
  sortable: 'name',
  props: { width: 45 },
});

export const Category = (intl) => ({
  title: intl.formatMessage(messages.category),
  Component: CategoryCell,
});

export const Systems = (intl) => ({
  title: intl.formatMessage(messages.systems),
  Component: SystemsCell,
  sortable: 'impacted_systems_count',
  props: { width: 10 },
});

export const Reboot = (intl) => ({
  title: intl.formatMessage(messages.reboot),
  Component: (props) => <RebootCell {...props} intl={intl} />,
});

export const RecommendationLevel = (intl) => ({
  title: intl.formatMessage(messages.reclvl),
  Component: RecommendationLevelCell,
  sortable: 'recommendation_level',
  props: {
    width: 20,
    info: {
      tooltip: intl.formatMessage(messages.reclvldetails),
      tooltipProps: {
        isContentLeftAligned: true,
      },
    },
  },
});

/**
 * Returns array of all column configurations for PathwaysTable.
 * @param {object} intl - react-intl intl object for internationalization
 * @returns {Array} Array of column configuration objects
 */
export default (intl) => [
  Name(intl),
  Category(intl),
  Systems(intl),
  Reboot(intl),
  RecommendationLevel(intl),
];
