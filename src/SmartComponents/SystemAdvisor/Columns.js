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
  sortable: 'rule.description',
  exportKey: 'rule.description',
  props: { width: 40 },
};

export const Modified = {
  title: 'Modified',
  Component: ModifiedCell,
  sortable: 'rule.publish_date',
  exportKey: 'rule.publish_date',
  props: { modifier: 'fitContent' },
};

export const FirstImpacted = {
  title: 'First impacted',
  Component: FirstImpactedCell,
  sortable: 'impacted_date',
  exportKey: 'impacted_date',
  props: { modifier: 'fitContent' },
};

export const TotalRisk = {
  title: 'Total risk',
  Component: TotalRiskCell,
  sortable: 'rule.total_risk',
  exportKey: 'rule.total_risk',
  props: { modifier: 'fitContent' },
};

export const Remediation = {
  title: 'Remediation type',
  Component: RemediationCell,
  sortable: 'resolution.has_playbook',
  exportKey: 'resolution.has_playbook',
  renderExport: (hasPlaybook) =>
    hasPlaybook === null || hasPlaybook === undefined
      ? 'N/A'
      : hasPlaybook
        ? 'Playbook'
        : 'Manual',
  props: { modifier: 'fitContent' },
};

export default [
  Recommendation,
  Modified,
  FirstImpacted,
  TotalRisk,
  Remediation,
];
