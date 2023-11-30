import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import ImmutableDevices from './ImmutableDevices';
import { render } from '@testing-library/react';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useGetEntities, useActionResolver, useOnLoad } from './helpers';

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

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  useGetEntities: jest.fn(() => {}),
  useActionResolver: jest.fn(() => () => {}),
  useOnLoad: jest.fn(),
}));

const renderAndWait = async (componentProps = {}, renderOptions = {}) => {
  render(
    <ComponentWithContext
      Component={ImmutableDevices}
      componentProps={componentProps}
      renderOptions={renderOptions}
    />
  );
  await waitFor(() => {
    expect(
      screen.getByLabelText('immutableDevices-module-mock')
    ).toBeInTheDocument();
  });
};

describe('ImmutableDevices', () => {
  test('renders without issues', async () => {
    await renderAndWait();
  });

  test('renders with correct custom filters', async () => {
    await renderAndWait();
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
    await renderAndWait();

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'inventory',
        module: './ImmutableDevices',
      }),
      {}
    );
  });

  test('loads ImmutableDevices federated module', async () => {
    await renderAndWait();

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'inventory',
        module: './ImmutableDevices',
      }),
      {}
    );
  });

  test('should display name and os filter from the ImmutableDevices federated module', async () => {
    await renderAndWait();

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        hideFilters: {
          all: true,
          name: false,
          operatingSystem: false,
          tags: false,
        },
      }),
      {}
    );
  });

  test('should call getEntities with correct function arguments', async () => {
    await renderAndWait({ pathway: 'test-pathway', rule: 'test-rule' });
    expect(useGetEntities).toHaveBeenCalledWith(
      expect.any(Function),
      'test-pathway',
      'test-rule'
    );
  });

  test('should not provide actionsResolver when pathway detail ', async () => {
    const handleModalToggle = jest.fn();
    await renderAndWait({
      pathway: 'test-pathway',
      rule: 'test-rule',
      isRecommendationDetail: false,
      handleModalToggle,
    });

    expect(AsynComponent).toHaveBeenCalledWith(
      expect.not.objectContaining({
        tableActions: expect.any(Function),
      }),
      {}
    );
  });

  test('should provide actionsResolver with handleModalToggle prop when recommendation detail', async () => {
    const handleModalToggle = jest.fn();
    await renderAndWait({
      pathway: 'test-pathway',
      rule: 'test-rule',
      isRecommendationDetail: true,
      handleModalToggle,
    });

    expect(useActionResolver).toHaveBeenCalledWith(handleModalToggle);
    expect(AsynComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        tableActions: expect.any(Function),
      }),
      {}
    );
  });

  test('should display name and os filter from the ImmutableDevices federated module', async () => {
    await renderAndWait();

    expect(useOnLoad).toHaveBeenCalledWith({
      limit: 20,
      name: '',
      offset: 0,
      sort: '-last_seen',
    });
  });
});
