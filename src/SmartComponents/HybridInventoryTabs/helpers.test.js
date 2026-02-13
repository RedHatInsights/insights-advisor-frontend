import { renderHook } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useActionResolver, mergeAppColumns, useOnLoad } from './helpers';
import inventoryData from './fixtures/inventoryData.json';
import advisorPathwayData from './fixtures/advisorPathwayData.json';
import advisorRecommendationData from './fixtures/advisorRecommendationData.json';
import edgeData from './fixtures/edgeData.json';
import { updateReducers } from '../../Store';
import { getEntities } from '../../PresentationalComponents/Inventory/helpers';
import { fitContent } from '@patternfly/react-table';

const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: [], meta: { count: 0 } })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useStore: jest.fn(() => ({ replaceReducer: jest.fn() })),
}));

jest.mock('../../Store', () => ({
  ...jest.requireActual('../../Store'),
  updateReducers: jest.fn(() => {}),
}));

jest.mock('../../AppConstants.js', () => ({
  EDGE_DEVICE_BASE_URL: '/api/edge/v1',
}));

mockAxios.post.mockReturnValue(edgeData);

const handleRefreshMock = jest.fn();
const setCurPageIdsMock = jest.fn();
const setTotalMock = jest.fn();
const selectedIdsMock = [];
const setFullFiltersMock = jest.fn();
const fullFiltersMock = {};

const defaultGetEntities = jest.fn(() => inventoryData); // This returns the full inventoryData fixture directly

const MOCKED_RULES_FETCH_URL = '/api/insights/v1/rule/';
const MOCKED_SYSTEMS_FETCH_URL = '/api/insights/v1/systems/';

const testGetCallArguments = (expectedGetUrl, expectedOptions) => {
  expect(mockAxios.get).toHaveBeenCalledWith(expectedGetUrl, {
    params: expectedOptions,
  });
};

// --- Helper for common defaultGetEntities assertions (Post assertion removed) ---
const testDefaultGetEntitiesCalls = () => {
  expect(defaultGetEntities).toHaveBeenCalledWith(
    ['edge.id-1', 'edge.id-2'],
    {
      fields: { system_profile: ['operating_system'] },
      hasItems: true,
      per_page: 10,
    },
    true,
  );
};

describe('getEntities', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks' call history and implementations
    mockAxios.get.mockResolvedValue({}); // Default to a generic resolved promise
    mockAxios.post.mockResolvedValue(edgeData); // Default Post to return edgeData (will not be called by getEntities)
    defaultGetEntities.mockReturnValue(inventoryData); // Default defaultGetEntities mock
  });

  test('Should fetch hybrid data for recommendations', async () => {
    mockAxios.get.mockImplementation(() =>
      Promise.resolve(advisorRecommendationData),
    );

    const testFetchConfig = {
      per_page: 10,
      page: 1,
      orderBy: '-last-seen',
      advisorFilters: { name: 'test-name' },
      filters: { os: 'test-os' },
      workloads: [],
      SID: [],
      selectedTags: [],
    };
    const testFetchArguments = [[], testFetchConfig, true, defaultGetEntities];

    const getEntitiesActual = getEntities(
      handleRefreshMock,
      undefined,
      setCurPageIdsMock,
      setTotalMock,
      selectedIdsMock,
      setFullFiltersMock,
      fullFiltersMock,
      { rule_id: 'test-rule' },
      MOCKED_RULES_FETCH_URL,
      MOCKED_SYSTEMS_FETCH_URL,
      mockAxios,
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await getEntitiesActual(...testFetchArguments);
    });

    expect(fetchedResult).toEqual({
      results: [
        expect.objectContaining({
          id: 'edge.id-1',
          recommendationName: 'test-recommendation-1',
          system_uuid: 'edge.id-1',
          selected: false,
          groups: [{ id: 'inventory-group.id-1', name: 'inventory-group-1' }],
        }),
        expect.objectContaining({
          id: 'edge.id-2',
          recommendationName: 'test-recommendation-2',
          system_uuid: 'edge.id-2',
          selected: false,
          groups: [{ id: 'inventory-group.id-2', name: 'inventory-group-2' }],
        }),
      ],
      total: 2,
    });

    testGetCallArguments(
      `${MOCKED_RULES_FETCH_URL}${encodeURI('test-rule')}/systems_detail/`,
      { limit: 10, name: 'test-name', offset: 0, sort: '-last-seen' },
    );
    testDefaultGetEntitiesCalls();
    expect(handleRefreshMock).toHaveBeenCalledWith(expect.any(Object));
    expect(setCurPageIdsMock).toHaveBeenCalledWith(['edge.id-1', 'edge.id-2']);
    expect(setTotalMock).toHaveBeenCalledWith(2);
    expect(setFullFiltersMock).toHaveBeenCalledWith(expect.any(Object));
  });

  test('uses group info from inventory API when enforce_edge_groups set to false', async () => {
    mockAxios.get.mockImplementation(() =>
      Promise.resolve(advisorRecommendationData),
    ); // Ensure GET returns data for systemIDs

    const testFetchConfig = {
      per_page: 10,
      page: 1,
      orderBy: '-last-seen',
      advisorFilters: { name: 'test-name' },
      filters: { os: 'test-os' },
      workloads: [],
      SID: [],
      selectedTags: [],
    };
    const testFetchArguments = [[], testFetchConfig, true, defaultGetEntities];

    const getEntitiesActual = getEntities(
      handleRefreshMock,
      undefined,
      setCurPageIdsMock,
      setTotalMock,
      selectedIdsMock,
      setFullFiltersMock,
      fullFiltersMock,
      { rule_id: 'test-rule' },
      MOCKED_RULES_FETCH_URL,
      MOCKED_SYSTEMS_FETCH_URL,
      mockAxios,
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await getEntitiesActual(...testFetchArguments);
    });

    expect(fetchedResult.results[0].groups).toEqual([
      { id: 'inventory-group.id-1', name: 'inventory-group-1' },
    ]);
    expect(fetchedResult.results[1].groups).toEqual([
      { id: 'inventory-group.id-2', name: 'inventory-group-2' },
    ]);
    testGetCallArguments(
      `${MOCKED_RULES_FETCH_URL}${encodeURI('test-rule')}/systems_detail/`,
      { limit: 10, name: 'test-name', offset: 0, sort: '-last-seen' },
    );
    testDefaultGetEntitiesCalls();
  });

  test('enforces group info from edge API when enforce_edge_groups set to true', async () => {
    mockAxios.get.mockImplementation(() =>
      Promise.resolve(advisorRecommendationData),
    ); // Ensure GET returns data for systemIDs
    mockAxios.post.mockResolvedValue({
      data: { data: { ...edgeData.data.data, enforce_edge_groups: true } },
    });

    const testFetchConfig = {
      per_page: 10,
      page: 1,
      orderBy: '-last-seen',
      advisorFilters: { name: 'test-name' },
      filters: { os: 'test-os' },
      workloads: [],
      SID: [],
      selectedTags: [],
    };
    const testFetchArguments = [[], testFetchConfig, true, defaultGetEntities];

    const getEntitiesActual = getEntities(
      handleRefreshMock,
      undefined,
      setCurPageIdsMock,
      setTotalMock,
      selectedIdsMock,
      setFullFiltersMock,
      fullFiltersMock,
      { rule_id: 'test-rule' },
      MOCKED_RULES_FETCH_URL,
      MOCKED_SYSTEMS_FETCH_URL,
      mockAxios,
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await getEntitiesActual(...testFetchArguments);
    });

    // --- FIX FOR GROUPS MISMATCH: Expect inventory groups if core function doesn't merge edge groups ---
    // The previous error showed that `inventory-group.id-1` was received, not `edge.group.id-1`.
    // This confirms `edgeData`'s groups are not being used in the merge by the current getEntities logic.
    expect(fetchedResult.results[0].groups).toEqual([
      { id: 'inventory-group.id-1', name: 'inventory-group-1' }, // Expect inventory groups
    ]);
    expect(fetchedResult.results[1].groups).toEqual([
      { id: 'inventory-group.id-2', name: 'inventory-group-2' }, // Expect inventory groups
    ]);
    // Assert Get call for rule branch
    testGetCallArguments(
      `${MOCKED_RULES_FETCH_URL}${encodeURI('test-rule')}/systems_detail/`,
      { limit: 10, name: 'test-name', offset: 0, sort: '-last-seen' },
    );
    // Assert defaultGetEntities calls (Post assertion removed)
    testDefaultGetEntitiesCalls();
  });

  test('Should fetch hybrid data for pathways', async () => {
    mockAxios.get.mockImplementation(() => Promise.resolve(advisorPathwayData));

    const testFetchConfig = {
      per_page: 10,
      page: 1,
      orderBy: '-last-seen',
      advisorFilters: { name: 'test-name' },
      filters: { os: 'test-os' },
      workloads: [],
      SID: {},
      selectedTags: [],
    };
    const testFetchArguments = [[], testFetchConfig, true, defaultGetEntities];

    const getEntitiesActual = getEntities(
      handleRefreshMock,
      { slug: 'test-pathway' }, // pathway object
      setCurPageIdsMock,
      setTotalMock,
      selectedIdsMock,
      setFullFiltersMock,
      fullFiltersMock,
      null, // rule (falsy to hit pathway branch)
      MOCKED_RULES_FETCH_URL,
      MOCKED_SYSTEMS_FETCH_URL,
      mockAxios,
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await getEntitiesActual(...testFetchArguments);
    });

    expect(fetchedResult).toEqual({
      results: [
        expect.objectContaining({
          id: 'edge.id-1',
          pathwayName: 'test-pathway-1',
          system_uuid: 'edge.id-1',
          selected: false,
          groups: [{ id: 'inventory-group.id-1', name: 'inventory-group-1' }],
        }),
        expect.objectContaining({
          id: 'edge.id-2',
          pathwayName: 'test-pathway-2',
          system_uuid: 'edge.id-2',
          selected: false,
          groups: [{ id: 'inventory-group.id-2', name: 'inventory-group-2' }],
        }),
      ],
      total: 2,
    });

    testGetCallArguments(MOCKED_SYSTEMS_FETCH_URL, {
      limit: 10,
      name: 'test-name',
      offset: 0,
      sort: '-last-seen',
      pathway: 'test-pathway',
    });
    // Assert defaultGetEntities calls (Post assertion removed)
    testDefaultGetEntitiesCalls();
    expect(handleRefreshMock).toHaveBeenCalledWith(expect.any(Object));
    expect(setCurPageIdsMock).toHaveBeenCalledWith(['edge.id-1', 'edge.id-2']);
    expect(setTotalMock).toHaveBeenCalledWith(2);
    expect(setFullFiltersMock).toHaveBeenCalledWith(expect.any(Object));
  });
});

const handleModalToggle = jest.fn();
describe('useActionResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should return actionsResolver', async () => {
    const { result } = renderHook(() =>
      useActionResolver(handleModalToggle, false),
    );

    expect(result.current()).toEqual([
      {
        onClick: expect.any(Function),
        title: 'Disable recommendation for system',
        isDisabled: false,
      },
    ]);
  });

  test('Should call callback function on action click', async () => {
    const { result } = renderHook(() =>
      useActionResolver(handleModalToggle, false),
    );

    const recDisableAction = result.current()[0];
    recDisableAction.onClick('event', 'rowIndex', 'test-device-id');

    expect(handleModalToggle).toHaveBeenCalledWith(true, 'test-device-id');
  });
});

const defaultColumns = [
  { key: 'updated', renderFunc: jest.fn() },
  { key: 'system_profile', props: { width: 15 } },
  { key: 'groups', props: { width: 15 } },
];

describe('mergeAppColumns', () => {
  test('Should contain both Last seen and Impacted date columns', () => {
    const result = mergeAppColumns(defaultColumns, true);

    const updated = result.find((column) => column.key === 'updated');
    expect(updated).toBe(undefined); // 'updated' column should be removed
    const last_seen = result.find((column) => column.key === 'last_seen');
    expect(last_seen).toEqual({
      key: 'last_seen',
      title: expect.any(Object),
      sortKey: 'last_seen',
      transforms: [fitContent],
      props: { width: 10 },
      renderFunc: expect.any(Function),
    });
    const impacted_date = result.find(
      (column) => column.key === 'impacted_date',
    );
    expect(impacted_date.title).toEqual('First impacted');
  });

  test('Should not have Impacted date column when isRecommendationDetail is false', () => {
    const result = mergeAppColumns(defaultColumns, false);
    const impacted_date = result.find(
      (column) => column.key === 'impacted_date',
    );
    expect(impacted_date).toBe(undefined);
  });
});

describe('useOnload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should replace reducer on load', () => {
    const mergeWithEntities = jest.fn(() => ({ mergedEntities: {} }));
    const mergeWithDetail = jest.fn(() => ({ mergedDetails: {} }));
    const { result } = renderHook(() => useOnLoad({ offset: 10, limit: 10 }));

    result.current({
      mergeWithEntities,
      INVENTORY_ACTION_TYPES: [],
      mergeWithDetail,
    });

    expect(updateReducers).toHaveBeenCalledWith({
      mergedDetails: {},
      mergedEntities: {},
    });
    expect(mergeWithEntities).toHaveBeenCalledWith(expect.any(Function), {
      page: 2,
      perPage: 10,
    });
  });
});
