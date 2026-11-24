import columns, {
  Recommendation,
  Modified,
  FirstImpacted,
  TotalRisk,
  Remediation,
} from './Columns';

describe('SystemAdvisor Columns', () => {
  it('exports the default 5 columns in correct order', () => {
    expect(columns).toEqual([
      Recommendation,
      Modified,
      FirstImpacted,
      TotalRisk,
      Remediation,
    ]);
    expect(columns.map((c) => c.title)).toEqual([
      'Description',
      'Modified',
      'First impacted',
      'Total risk',
      'Remediation type',
    ]);
  });

  it('defines exportKey for every column to support TableTools export', () => {
    columns.forEach((col) => {
      expect(col.exportKey).toBeDefined();
      expect(typeof col.exportKey).toBe('string');
    });
  });

  it('maps correct exportKeys to each column schema', () => {
    expect(Recommendation.exportKey).toBe('rule.description');
    expect(Modified.exportKey).toBe('rule.publish_date');
    expect(FirstImpacted.exportKey).toBe('impacted_date');
    expect(TotalRisk.exportKey).toBe('rule.total_risk');
    expect(Remediation.exportKey).toBe('resolution.has_playbook');
  });

  describe('Remediation renderExport', () => {
    it('renders Playbook when hasPlaybook is true', () => {
      expect(Remediation.renderExport(true)).toBe('Playbook');
    });

    it('renders Manual when hasPlaybook is false', () => {
      expect(Remediation.renderExport(false)).toBe('Manual');
    });

    it('renders N/A when hasPlaybook is null or undefined', () => {
      expect(Remediation.renderExport(null)).toBe('N/A');
      expect(Remediation.renderExport(undefined)).toBe('N/A');
    });
  });
});
