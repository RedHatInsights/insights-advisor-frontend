import ListWrapped from '../ListWrapped';
import { IoP } from '../../index';

jest.mock('../../index', () => ({
  IoP: {
    ListIop: jest.fn(() => null),
  },
}));

describe('ListWrapped', () => {
  it('should export IoP.ListIop component', () => {
    expect(ListWrapped).toBe(IoP.ListIop);
  });
});
