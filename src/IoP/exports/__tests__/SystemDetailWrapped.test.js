import SystemDetailWrapped from '../SystemDetailWrapped';
import { IoP } from '../../index';

jest.mock('../../index', () => ({
  IoP: {
    SystemDetail: jest.fn(() => null),
  },
}));

describe('SystemDetailWrapped', () => {
  it('should export IoP.SystemDetail component', () => {
    expect(SystemDetailWrapped).toBe(IoP.SystemDetail);
  });
});
