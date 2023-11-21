import * as axios from 'axios';
import { edgeSystemsCheck } from './helpers';

jest.mock('axios');

const setSystemsCount = jest.fn((items) => items);
const setEdgeSystemsCount = jest.fn();
const setConventionalSystemsCount = jest.fn();
describe('edgeSystemsCheck state is getting set', () => {
  test('All state variables get called', async () => {
    const resp = { data: { meta: { count: 1 } } };

    axios.get.mockImplementation(() => Promise.resolve(resp));

    await edgeSystemsCheck(
      'test',
      setSystemsCount,
      setEdgeSystemsCount,
      setConventionalSystemsCount
    );

    await expect(setSystemsCount).toHaveBeenCalledWith(2);
    await expect(setEdgeSystemsCount).toHaveBeenCalledWith(1);
    await expect(setConventionalSystemsCount).toHaveBeenCalledWith(1);
  });
});
