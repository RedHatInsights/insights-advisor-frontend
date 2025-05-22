import React from 'react';
import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/react';
import { ZeroStateWrapper } from './ZeroStateWrapper';
import {
  useGetConventionalDevicesQuery,
  useGetEdgeDevicesQuery,
} from './Services/SystemVariety';
import { ComponentWithContext } from './Utilities/TestingUtilities';

jest.mock('./Utilities/Hooks', () => ({
  ...jest.requireActual('./Utilities/Hooks'),
  useFeatureFlag: jest.fn(() => false),
}));

jest.mock('./Services/SystemVariety', () => ({
  ...jest.requireActual('./Services/SystemVariety'),
  useGetConventionalDevicesQuery: jest.fn(() => ({
    data: {
      total: 5,
    },
    isSuccess: true,
    isError: false,
  })),
  useGetEdgeDevicesQuery: jest.fn(() => ({
    data: {
      total: 5,
    },
    isSuccess: true,
    isError: false,
  })),
}));

const noConvSystems = {
  data: {
    total: 0,
  },
  isSuccess: true,
  isError: false,
};

const notLoaded = {
  data: {
    total: 0,
  },
  isSuccess: false,
  isError: false,
};

describe('ZeroStateWrapper', () => {
  it('Should render children with conventional devices', () => {
    render(
      <ComponentWithContext
        Component={ZeroStateWrapper}
        componentProps={{ children: <div>Rendered</div> }}
      />
    );

    expect(screen.getByText('Rendered'));
  });

  it('Should render ZeroState with no systems', () => {
    useGetConventionalDevicesQuery.mockReturnValue(noConvSystems);
    useGetEdgeDevicesQuery.mockReturnValue({
      data: {
        total: 0,
      },
      isSuccess: true,
      isError: false,
    });
    render(
      <ComponentWithContext
        Component={ZeroStateWrapper}
        componentProps={{ children: <div>Rendered</div> }}
      />
    );

    expect(screen.getByText('AsyncComponent'));
  });

  it('Should not render ZeroState when waiting for data to load', () => {
    useGetConventionalDevicesQuery.mockReturnValue(notLoaded);
    render(
      <ComponentWithContext
        Component={ZeroStateWrapper}
        componentProps={{ children: <div>Rendered</div> }}
      />
    );

    expect(screen.getByText('Rendered'));
  });
});
