import {
  RecommendationCell,
  ModifiedCell,
  CategoryCell,
  TotalRiskCell,
  SystemsCell,
  RemediationCell,
} from './Cells';

/**
 * Column definitions for RulesTable (tabletools implementation)
 *
 * Each column exports:
 * - title: Column header text
 * - Component: Cell render component
 * - sortable: API field name for sorting
 * - props: PatternFly table column props (width, modifier)
 */

export const Recommendation = {
  title: 'Name',
  Component: RecommendationCell,
  sortable: 'description',
  props: { width: 40 },
};

export const Modified = {
  title: 'Modified',
  Component: ModifiedCell,
  sortable: 'publish_date',
  props: { modifier: 'fitContent' },
};

export const Category = {
  title: 'Category',
  Component: CategoryCell,
  sortable: 'category',
  props: { modifier: 'fitContent' },
};

export const TotalRisk = {
  title: 'Total risk',
  Component: TotalRiskCell,
  sortable: 'total_risk',
  props: { modifier: 'fitContent' },
};

export const Systems = {
  title: 'Systems',
  Component: SystemsCell,
  sortable: 'impacted_count',
  props: { modifier: 'fitContent' },
};

export const Remediation = {
  title: 'Remediation type',
  Component: RemediationCell,
  sortable: 'playbook_count',
  props: { modifier: 'fitContent' },
};

export default [
  Recommendation,
  Modified,
  Category,
  TotalRisk,
  Systems,
  Remediation,
];
