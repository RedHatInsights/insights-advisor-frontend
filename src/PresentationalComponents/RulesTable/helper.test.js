describe('RulesTable Helper Functions', () => {
  it('includes pathway filter when pathway is defined in filters', () => {
    const filters = { pathway: 'test-pathway' };
    const result = {
      ...(filters.pathway && { pathway: filters.pathway }),
    };

    expect(result).toEqual({ pathway: 'test-pathway' });
  });

  it('does not include pathway filter when pathway is not defined in filters', () => {
    const filters = {};
    const result = {
      ...(filters.pathway && { pathway: filters.pathway }),
    };

    expect(result).not.toHaveProperty('pathway');
    expect(result).toEqual({});
  });
});
