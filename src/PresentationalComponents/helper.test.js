import { sortTopics, createOptions } from './helper';
import fixtures from '../../cypress/fixtures/topics.json';

describe('sortTopics test', () => {
  const indexes = [0, 2, 3];
  const directions = ['asc', 'desc'];
  test('the function is called with the Name column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[0], directions[1]);

    expect(sortResult[0].description).toBe('ABZ');
  });
  test('the function is called with the Name column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[0], directions[0]);

    expect(sortResult[0].description).toBe('TEST');
  });
  test('the function is called with the Featured column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[1], directions[1]);

    expect(sortResult[0].featured).toBe(true);
  });
  test('the function is called with the Featured column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[1], directions[0]);

    expect(sortResult[0].featured).toBe(false);
  });
  test('the function is called with the Impacted systems column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[2], directions[1]);

    expect(sortResult[0].impacted_systems_count).toBe(694);
  });
  test('the function is called with the Impacted systems column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[2], directions[0]);

    expect(sortResult[0].impacted_systems_count).toBe(0);
  });
});

describe('createOptions', () => {
  const advisorFilters = '';
  const page = 1;
  const per_page = 20;
  const sort = '';
  const pathway = '';
  const filters = '';
  const selectedTags = '';
  const workloads = '';
  const SID = '';
  const systemsPage = '';

  it('returns API options', () => {
    expect(
      createOptions(
        advisorFilters,
        page,
        per_page,
        sort,
        pathway,
        filters,
        selectedTags,
        workloads,
        SID,
        systemsPage
      )
    ).toEqual({
      sort: '',
      offset: 0,
      limit: 20,
    });
  });

  it('returns a name prop in the API options when hostnameOrId is in filters', () => {
    const hostnameOrId = 'HOST_NAME_ID';

    expect(
      createOptions(
        advisorFilters,
        page,
        per_page,
        sort,
        pathway,
        { hostnameOrId },
        selectedTags,
        workloads,
        SID,
        systemsPage
      ).name
    ).toEqual(hostnameOrId);
  });

  it('returns a rhel_version prop in the API options when osFilter is in filters', () => {
    const osFilter = [{ value: '7.8' }, { value: '7.9' }];

    expect(
      createOptions(
        advisorFilters,
        page,
        per_page,
        sort,
        pathway,
        { osFilter },
        selectedTags,
        workloads,
        SID,
        systemsPage
      ).rhel_version
    ).toEqual('7.8,7.9');
  });

  it('returns a groups prop in the API options when hostGroupFilter is in filters', () => {
    const hostGroupFilter = ['group1', 'group2'];

    expect(
      createOptions(
        advisorFilters,
        page,
        per_page,
        sort,
        pathway,
        { hostGroupFilter },
        selectedTags,
        workloads,
        SID,
        systemsPage
      ).groups
    ).toEqual('group1,group2');
  });

  it('returns a tags prop in the API options when tagFilters is in filters', () => {
    const tagFilters = [
      {
        key: 'tagFilter1',
        values: [
          { key: 'tag1', tagKey: 'tagKey1', value: 'tag1' },
          { key: 'tag2', tagKey: 'tagKey2', value: 'tag2' },
        ],
      },
    ];

    expect(
      createOptions(
        advisorFilters,
        page,
        per_page,
        sort,
        pathway,
        { tagFilters },
        selectedTags,
        workloads,
        SID,
        systemsPage
      ).tags
    ).toEqual(['tagFilter1/tagKey1=tag1', 'tagFilter1/tagKey2=tag2']);
  });
});
