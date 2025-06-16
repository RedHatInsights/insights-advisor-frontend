import { sortTopics, createOptions, createSortParam } from './helper';
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
        systemsPage,
      ),
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
        systemsPage,
      ).name,
    ).toEqual(hostnameOrId);
  });

  it('returns a rhel_version prop in the API options when osFilter is in filters', () => {
    const osFilter = {
      'RHEL-9': {
        'RHEL-9': true,
        'RHEL-9-9.0': true,
        'RHEL-9-9.1': true,
        'RHEL-9-9.5': true,
        'RHEL-9-9.3': true,
        'RHEL-9-9.4': true,
        'RHEL-9-9.2': true,
      },
      'RHEL-8': {
        'RHEL-8': null,
        'RHEL-8-8.0': true,
        'RHEL-8-8.2': true,
      },
    };

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
        systemsPage,
      ).rhel_version,
    ).toEqual('9.0,9.1,9.5,9.3,9.4,9.2,8.0,8.2');
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
        systemsPage,
      ).groups,
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
        systemsPage,
      ).tags,
    ).toEqual(['tagFilter1/tagKey1=tag1', 'tagFilter1/tagKey2=tag2']);
  });
});

describe('createSortParam test', () => {
  const field = ['updated', 'operating_system', 'groups'];
  const direction = ['asc', 'desc'];

  it('creates correct updated sort param in asc and desc', () => {
    const updatedAsc = createSortParam(field[0], direction[0]);
    expect(updatedAsc).toBe('last_seen');
    const updatedDesc = createSortParam(field[0], direction[1]);
    expect(updatedDesc).toBe('-last_seen');
  });

  it('creates correct operating_system sort param in asc and desc in uppercase', () => {
    const OSAsc = createSortParam(field[1], direction[0].toUpperCase());
    expect(OSAsc).toBe('rhel_version');
    const OSDesc = createSortParam(field[1], direction[1].toUpperCase());
    expect(OSDesc).toBe('-rhel_version');
  });

  it('creates correct groups sort param with missing / unknown sort direction', () => {
    const groupsAsc = createSortParam(field[2]);
    expect(groupsAsc).toBe('group_name');
    const groupsDesc = createSortParam(field[2], 'foobar');
    expect(groupsDesc).toBe('-group_name');
  });

  it('creates other sort params verbatim', () => {
    const sortAsc = createSortParam('misc', 'AsC');
    expect(sortAsc).toBe('misc');
    const sortDesc = createSortParam('misc', 'misc');
    expect(sortDesc).toBe('-misc');
  });
});
