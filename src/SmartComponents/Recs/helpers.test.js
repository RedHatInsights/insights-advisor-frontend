import * as axios from 'axios';
import { systemsCheck, fetchIOPUserPermissions } from './helpers';

jest.mock('axios');

afterEach(() => {
  jest.clearAllMocks();
});

const setSystemsCount = jest.fn((items) => items);
const setConventionalSystemsCount = jest.fn();
const setCountsLoading = jest.fn();
describe('systemsCheck state is getting set', () => {
  test('All state variables get called', async () => {
    const resp = { data: { meta: { count: 1 } } };

    axios.get.mockImplementation(() => Promise.resolve(resp));

    await systemsCheck(
      'test',
      setSystemsCount,
      setConventionalSystemsCount,
      setCountsLoading,
      'pathway',
      '/api/insights/v1',
    );

    await expect(setSystemsCount).toHaveBeenCalledWith(1);
    await expect(setConventionalSystemsCount).toHaveBeenCalledWith(1);
    await expect(setCountsLoading).toHaveBeenCalledWith(false);
  });

  test('should get recommendation data', async () => {
    const resp = { data: { meta: { count: 1 } } };

    axios.get.mockImplementation(() => Promise.resolve(resp));

    await systemsCheck(
      'test',
      setSystemsCount,
      setConventionalSystemsCount,
      setCountsLoading,
      'pathway',
      '/api/insights/v1',
    );

    expect(axios.get).toHaveBeenCalledWith(
      '/api/insights/v1/rule/test/systems_detail/?filter[system_profile]=true&limit=1',
    );
  });

  test('should get pathway data', async () => {
    const resp = { data: { meta: { count: 1 } } };

    axios.get.mockImplementation(() => Promise.resolve(resp));

    await systemsCheck(
      undefined,
      setSystemsCount,
      setConventionalSystemsCount,
      setCountsLoading,
      'pathway',
      '/api/insights/v1',
    );

    expect(axios.get).toHaveBeenCalledWith(
      '/api/insights/v1/system/?limit=1&filter[system_profile]&pathway=pathway',
    );
  });
});

describe('fetchIOPUserPermissions', () => {
  const getUserPermissionsFunc = jest.fn();
  const setHasPermissionsFunc = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set hasPermissions to true when user has write permission', async () => {
    const mockPermissions = [
      { permission: 'advisor:disable-recommendations:write' },
      { permission: 'advisor:exports:read' },
    ];

    getUserPermissionsFunc.mockResolvedValue(mockPermissions);
    await fetchIOPUserPermissions(
      getUserPermissionsFunc,
      setHasPermissionsFunc,
    );

    expect(getUserPermissionsFunc).toHaveBeenCalledWith('advisor');
    expect(setHasPermissionsFunc).toHaveBeenCalledWith(true);
  });

  test('should set hasPermissions to false when user does not have write permission', async () => {
    const mockPermissions = [
      { permission: 'advisor:disable-recommendations:read' },
      { permission: 'advisor:exports:read' },
    ];

    getUserPermissionsFunc.mockResolvedValue(mockPermissions);
    await fetchIOPUserPermissions(
      getUserPermissionsFunc,
      setHasPermissionsFunc,
    );

    expect(getUserPermissionsFunc).toHaveBeenCalledWith('advisor');
    expect(setHasPermissionsFunc).toHaveBeenCalledWith(false);
  });

  test('should set hasPermissions to false when permissions array is empty', async () => {
    getUserPermissionsFunc.mockResolvedValue([]);
    await fetchIOPUserPermissions(
      getUserPermissionsFunc,
      setHasPermissionsFunc,
    );

    expect(getUserPermissionsFunc).toHaveBeenCalledWith('advisor');
    expect(setHasPermissionsFunc).toHaveBeenCalledWith(false);
  });

  test('should handle when getUserPermissionsFunc is undefined', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    await fetchIOPUserPermissions(undefined, setHasPermissionsFunc);

    expect(setHasPermissionsFunc).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Error fetching permissions: ',
      expect.any(TypeError),
    );
    consoleLogSpy.mockRestore();
  });
});
