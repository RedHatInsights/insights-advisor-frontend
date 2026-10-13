import {
  RecommendationCell,
  ModifiedCell,
  FirstImpactedCell,
  TotalRiskCell,
  RemediationCell,
} from './Cells';

/**
 * Column definitions for SystemAdvisor (tabletools implementation)
 */

export const Recommendation = {
  title: 'Description',
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

export const FirstImpacted = {
  title: 'First impacted',
  Component: FirstImpactedCell,
  sortable: 'impacted_date',
  props: { modifier: 'fitContent' },
};

export const TotalRisk = {
  title: 'Total risk',
  Component: TotalRiskCell,
  sortable: 'total_risk',
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
  FirstImpacted,
  TotalRisk,
  Remediation,
];
