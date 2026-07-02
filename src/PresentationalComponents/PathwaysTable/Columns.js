import {
  Name as NameCell,
  Category as CategoryCell,
  Systems as SystemsCell,
  Reboot as RebootCell,
  RecommendationLevelCell,
} from './Cells';

export const Name = {
  title: 'Name',
  Component: NameCell,
  sortable: 'name',
  props: { width: 45 },
};

export const Category = {
  title: 'Category',
  Component: CategoryCell,
};

export const Systems = {
  title: 'Systems',
  Component: SystemsCell,
  sortable: 'impacted_systems_count',
  props: { width: 10 },
};

export const Reboot = {
  title: 'Reboot',
  Component: RebootCell,
};

export const RecommendationLevel = {
  title: 'Recommendation level',
  Component: RecommendationLevelCell,
  sortable: 'recommendation_level',
  props: {
    width: 20,
    info: {
      tooltip: `Indicates a recommendation's urgency on a scale of high (fix immediately) to low (fix when convenient). Recommendations levels are constantly re-calculated based on your infrastructure's number of applicable recommendations, associated risks and total number of impacted systems.`,
      tooltipProps: {
        isContentLeftAligned: true,
      },
    },
  },
};

export default [Name, Category, Systems, Reboot, RecommendationLevel];
