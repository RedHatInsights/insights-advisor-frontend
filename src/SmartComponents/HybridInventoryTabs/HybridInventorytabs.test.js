import React from 'react';
import HybridInventory from './HybridInventoryTabs';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { AccountStatContext } from '../../ZeroStateWrapper';

jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} aria-label="hybrid-inventory-mock">
      AsyncComponent
    </div>
  )),
}));

jest.mock('../../Utilities/Hooks', () => ({
  ...jest.requireActual('../../Utilities/Hooks'),
  useFeatureFlag: jest.fn(() => false),
}));

const accountContextValue = {
  hasConventionalSystems: true,
  hasEdgeDevices: true,
};

const hybridSystemsCounts = {
  conventionalSystemsCount: 10,
  edgeSystemsCount: 10,
  areCountsLoading: false,
};

const renderComponent = (props, accountContextValues = accountContextValue) => {
  render(
    <AccountStatContext.Provider value={accountContextValues}>
      <HybridInventory {...props} />
    </AccountStatContext.Provider>
  );
};

const waitAsyncComponent = async () => {
  await waitFor(() => {
    expect(screen.getByLabelText('hybrid-inventory-mock')).toBeInTheDocument();
  });
};

describe('HybridInventory', () => {
  it('Should auto switch to edge tab  when there is no conventional systems, but there is edge device', async () => {
    renderComponent(
      { ...hybridSystemsCounts, conventionalSystemsCount: 0 },
      accountContextValue
    );

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        hasConventionalSystems: false,
      }),
      {}
    );
  });
  it('Should not auto switch to edge tab automatically when there is no conventional systems and no edge device', async () => {
    renderComponent(
      {
        ...hybridSystemsCounts,
        conventionalSystemsCount: 0,
        edgeSystemsCount: 0,
      },
      accountContextValue
    );

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        hasConventionalSystems: true,
      }),
      {}
    );
  });
  it('Should not auto switch to edge tab automatically when there are both conventional systems and edge device', async () => {
    renderComponent(hybridSystemsCounts, accountContextValue);

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        hasConventionalSystems: true,
      }),
      {}
    );
  });
  it('Should pass isImmutableTabOpen prop to fed-module', async () => {
    renderComponent({ isImmutableTabOpen: true, ...hybridSystemsCounts });

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        isImmutableTabOpen: true,
      }),
      {}
    );
  });
  it('Should pass accountHasEdgeImages prop to fed-module from accountContext', async () => {
    renderComponent(hybridSystemsCounts);

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        accountHasEdgeImages: true,
      }),
      {}
    );
  });

  it('Should pass correct tabPath prop to fed-module from accountContext', async () => {
    renderComponent({ ...hybridSystemsCounts, ruleId: 'testRule' });

    await waitAsyncComponent();
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        tabPathname: '/insights/advisor/recommendations/testRule',
      }),
      {}
    );
  });
});
