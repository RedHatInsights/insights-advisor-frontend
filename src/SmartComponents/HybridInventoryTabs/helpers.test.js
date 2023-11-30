import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import {
  useGetEntities,
  useActionResolver,
  mergeAppColumns,
  useOnLoad,
} from './helpers';
import { Get, Post } from '../../Utilities/Api';
import inventoryData from './fixtures/inventoryData.json';
import advisorPathwayData from './fixtures/advisorPathwayData.json';
import advisorRecommendationData from './fixtures/advisorRecommendationData.json';
import edgeData from './fixtures/edgeData.json';
import { updateReducers } from '../../Store';

jest.mock('../../Utilities/Api', () => ({
  ...jest.requireActual('../../Utilities/Api'),
  Get: jest.fn(() => Promise.resolve({})),
  Post: jest.fn(() => Promise.resolve({})),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useStore: jest.fn(() => ({ replaceReducer: jest.fn() })),
}));

jest.mock('../../Store', () => ({
  ...jest.requireActual('../../Store'),
  updateReducers: jest.fn(() => {}),
}));

Post.mockReturnValue(edgeData);

const handleRefreshMock = jest.fn();
const defaultGetEntities = jest.fn(() => inventoryData);
const fetchConfig = {
  per_page: 10,
  page: 1,
  orderBy: '-last-seen',
  advisorFilters: { name: 'test-name' },
  filters: { os: 'test-os' },
  workloads: [],
  SID: [],
  selectedTags: [],
};
const fetchArguments = [[], fetchConfig, true, defaultGetEntities];

const testApiCallArguments = () => {
  expect(Get).toHaveBeenCalledWith(
    '/api/insights/v1/rule/test-rule/systems_detail/',
    {},
    { limit: 10, name: 'test-name', offset: 0, sort: '--last-seen' }
  );
  expect(Post).toHaveBeenCalledWith(
    '/api/edge/v1/devices/devicesview',
    {},
    { devices_uuid: ['edge.id-1', 'edge.id-2'] }
  );
  expect(defaultGetEntities).toHaveBeenCalledWith(
    ['edge.id-1', 'edge.id-2'],
    {
      fields: { system_profile: ['operating_system'] },
      hasItems: true,
      per_page: 10,
    },
    true
  );
};

describe('getEntities', () => {
  test('Should fetch hybrid data for recommendations', async () => {
    Get.mockReturnValue(Promise.resolve(advisorRecommendationData));

    const { result } = renderHook(() =>
      useGetEntities(handleRefreshMock, undefined, { rule_id: 'test-rule' })
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await result.current(...fetchArguments);
    });

    expect(fetchedResult).toEqual({
      results: [
        expect.objectContaining({
          id: 'edge.id-1',
          DeviceUUID: 'edge.id-1',
          deviceName: 'test-device-1',
          system_uuid: 'edge.id-1',
          recommendationName: 'test-recommendation-1',
        }),
        expect.objectContaining({
          id: 'edge.id-2',
          DeviceUUID: 'edge.id-2',
          deviceName: 'test-device-2',
          system_uuid: 'edge.id-2',
          recommendationName: 'test-recommendation-2',
        }),
      ],
      total: 2,
    });

    testApiCallArguments();
  });

  test('uses group info from inventory API when enforce_edge_groups set to false', async () => {
    const { result } = renderHook(() =>
      useGetEntities(handleRefreshMock, undefined, { rule_id: 'test-rule' })
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await result.current(...fetchArguments);
    });

    expect(fetchedResult.results[0].groups).toEqual([
      { id: 'inventory-group.id-1', name: 'inventory-group-1' },
    ]);
    expect(fetchedResult.results[1].groups).toEqual([
      { id: 'inventory-group.id-2', name: 'inventory-group-2' },
    ]);
  });

  test('enforces group info from edge API when enforce_edge_groups set to true', async () => {
    Post.mockReturnValue({
      data: { data: { ...edgeData.data.data, enforce_edge_groups: true } },
    });

    const { result } = renderHook(() =>
      useGetEntities(handleRefreshMock, undefined, { rule_id: 'test-rule' })
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await result.current(...fetchArguments);
    });

    expect(fetchedResult.results[0].groups).toEqual([
      { id: 'edge.group.id-1', name: 'edge.group-1' },
    ]);
    expect(fetchedResult.results[1].groups).toEqual([
      { id: 'edge.group.id-2', name: 'edge.group-2' },
    ]);
  });

  test('Should fetch hybrid data for pathways', async () => {
    Get.mockReturnValue(Promise.resolve(advisorPathwayData));
    const { result } = renderHook(() =>
      useGetEntities(handleRefreshMock, 'test-pathway')
    );

    let fetchedResult;
    await act(async () => {
      fetchedResult = await result.current(...fetchArguments);
    });

    expect(fetchedResult).toEqual({
      results: [
        expect.objectContaining({
          DeviceUUID: 'edge.id-1',
          deviceName: 'test-device-1',
          id: 'edge.id-1',
          pathwayName: 'test-pathway-1',
          system_uuid: 'edge.id-1',
        }),
        expect.objectContaining({
          DeviceUUID: 'edge.id-2',
          deviceName: 'test-device-2',
          id: 'edge.id-2',
          pathwayName: 'test-pathway-2',
          system_uuid: 'edge.id-2',
        }),
      ],
      total: 2,
    });

    testApiCallArguments();
  });
});

const handleModalToggle = jest.fn();
describe('useActionResolver', () => {
  test('Should return actionsResolver', async () => {
    const { result } = renderHook(() => useActionResolver(handleModalToggle));

    expect(result.current()).toEqual([
      {
        onClick: expect.any(Function),
        title: 'Disable recommendation for system',
      },
    ]);
  });

  test('Should call callback function on action click', async () => {
    const { result } = renderHook(() => useActionResolver(handleModalToggle));

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
  test('Should use last seen column render function for impacted column', () => {
    const result = mergeAppColumns(defaultColumns);

    const impacted_date = result.find(
      (column) => column.key === 'impacted_date'
    );
    expect(impacted_date.renderFunc).toEqual(defaultColumns[0].renderFunc);
  });
  test('Should extend OS column props to disable sorting', () => {
    const result = mergeAppColumns(defaultColumns);

    const system_profile = result.find(
      (column) => column.key === 'system_profile'
    );
    expect(system_profile.props).toEqual({ width: 15, isStatic: true });
  });
  test('Should extend groups column props to disable sorting', () => {
    const result = mergeAppColumns(defaultColumns);

    const groups = result.find((column) => column.key === 'groups');
    expect(groups.props).toEqual({ width: 15, isStatic: true });
  });
});

describe('useOnload', () => {
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
