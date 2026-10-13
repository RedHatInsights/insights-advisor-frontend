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
  exportKey: 'description',
  props: { width: 40 },
};

export const Modified = {
  title: 'Modified',
  Component: ModifiedCell,
  sortable: 'publish_date',
  exportKey: 'publish_date',
  props: { modifier: 'fitContent' },
};

export const Category = {
  title: 'Category',
  Component: CategoryCell,
  sortable: 'category',
  exportKey: 'category',
  props: { modifier: 'fitContent' },
};

export const TotalRisk = {
  title: 'Total risk',
  Component: TotalRiskCell,
  sortable: 'total_risk',
  exportKey: 'total_risk',
  props: { modifier: 'fitContent' },
};

export const Systems = {
  title: 'Systems',
  Component: SystemsCell,
  sortable: 'impacted_count',
  exportKey: 'impacted_count',
  props: { modifier: 'fitContent' },
};

export const Remediation = {
  title: 'Remediation type',
  Component: RemediationCell,
  sortable: 'playbook_count',
  exportKey: 'playbook_count',
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
