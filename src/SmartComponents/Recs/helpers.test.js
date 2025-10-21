import * as axios from 'axios';
import { systemsCheck } from './helpers';

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
      '/api/insights/v1/rule/test/systems_detail/?filter[system_profile]&limit=1',
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
      '/api/insights/v1/system/?limit=1&filter[system_profile][host_type][nil]=true&pathway=pathway',
    );
  });
});
