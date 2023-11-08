import React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { renderWithContext } from '../../Utilities/TestingUtilities';
import ImmutableDevices from './ImmutableDevices';

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlag: () => true,
  useFlagsStatus: () => ({ flagsReady: true }),
}));

jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => (
  <div aria-label="immutableDevices-module-mock"></div>
));

afterEach(() => {
  jest.resetAllMocks();
});

const renderComponent = async (componentProps = {}, renderOptions = {}) => {
  renderWithContext(ImmutableDevices, componentProps, renderOptions);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByLabelText('Affected systems table title')
  //     ).toBeInTheDocument();
  //   });
};

describe('ImmutableDevices', () => {
  test('renders without issues', () => {
    renderComponent();
  });
});
