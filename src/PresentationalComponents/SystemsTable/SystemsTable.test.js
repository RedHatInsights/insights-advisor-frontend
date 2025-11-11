import React from 'react';
import '@testing-library/jest-dom';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import SystemsTable from './SystemsTable';
import { render } from '@testing-library/react';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  __esModule: true,
  InventoryTable: jest.fn((props) => (
    <div {...props} aria-label="immutableDevices-module-mock">
      InventoryTable
    </div>
  )),
}));

jest.mock('../Export/SystemsPdf', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} aria-label="systems-pdf-mock">
      SystemsPdf
    </div>
  )),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlag: () => true,
  useFlagsStatus: () => ({ flagsReady: true }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(() => ({ sysState: { page: 1, sort: '-last_seen' } })),
}));

describe('Systems', () => {
  it('Should always show conventional systems by filtering host_type', () => {
    render(<ComponentWithContext Component={SystemsTable} />);

    expect(InventoryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        customFilters: expect.objectContaining({
          advisorFilters: {
            'filter[system_profile]': true,
            sysState: { page: 1, sort: '-last_seen' },
          },
        }),
      }),
      {},
    );
  });
});
