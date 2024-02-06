import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EdgeSystemsBanner from './EdgeSystemsBanner';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import { AccountStatContext } from '../../ZeroStateWrapper';

describe('EdgeSystemsBanner', () => {
  it('does render with edge hosts present', () => {
    const { asFragment } = render(
      <ComponentWithContext
        Component={EdgeSystemsBanner}
        Context={AccountStatContext}
        contextValue={{ hasEdgeDevices: true }}
      />
    );

    expect(
      screen.getByText('Immutable systems are not shown in this list.')
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render with no edge hosts', () => {
    const { asFragment } = render(
      <ComponentWithContext
        Component={EdgeSystemsBanner}
        Context={AccountStatContext}
        contextValue={{ hasEdgeDevices: false }}
      />
    );

    expect(
      screen.queryByText('Immutable systems are not shown in this list.')
    ).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
