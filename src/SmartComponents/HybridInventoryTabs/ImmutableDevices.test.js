import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import ImmutableDevices from './ImmutableDevices';
import { render } from '@testing-library/react';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} aria-label="immutableDevices-module-mock">
      AsyncComponent
    </div>
  )),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlag: () => true,
  useFlagsStatus: () => ({ flagsReady: true }),
}));

const renderComponent = async (componentProps = {}, renderOptions = {}) => {
  render(
    <ComponentWithContext
      Component={ImmutableDevices}
      {...componentProps}
      {...renderOptions}
    />
  );
};
const renderAndWait = async () => {
  await renderComponent();
  await waitFor(() => {
    expect(
      screen.getByLabelText('immutableDevices-module-mock')
    ).toBeInTheDocument();
  });
};

describe('ImmutableDevices', () => {
  test('renders without issues', async () => {
    renderAndWait();
  });

  test('renders with correct custom filters', async () => {
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        customFilters: {
          advisorFilters: {
            'filter[system_profile][host_type]': 'edge',
            limit: 20,
            name: '',
            offset: 0,
            sort: '-last_seen',
          },
        },
      }),
      {}
    );
  });

  test('renders load ImmutableDevices federated module', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByLabelText('immutableDevices-module-mock')
      ).toBeInTheDocument();
    });

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'inventory',
        module: './ImmutableDevices',
      }),
      {}
    );
  });

  test('loads ImmutableDevices federated module', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByLabelText('immutableDevices-module-mock')
      ).toBeInTheDocument();
    });

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'inventory',
        module: './ImmutableDevices',
      }),
      {}
    );
  });

  test('should display name and os filter from the ImmutableDevices federated module', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByLabelText('immutableDevices-module-mock')
      ).toBeInTheDocument();
    });

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        hideFilters: {
          all: true,
          name: false,
          operatingSystem: false,
        },
      }),
      {}
    );
  });
});
