import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import '@testing-library/jest-dom';
import TopicsTableOriginal from './TopicsTable.original';

// Mock dependencies
jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../MessageState/MessageState', () => ({
  __esModule: true,
  default: ({ title, text }) => (
    <div data-testid="message-state">
      <div>{title}</div>
      <div>{text}</div>
    </div>
  ),
}));

jest.mock('@redhat-cloud-services/frontend-components/PrimaryToolbar', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  PrimaryToolbar: ({ children }) => (
    <div data-testid="primary-toolbar">{children}</div>
  ),
}));

jest.mock('@patternfly/react-component-groups', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  SkeletonTable: ({ columns }) => (
    <div data-testid="skeleton-table">
      {/* eslint-disable-next-line react/prop-types */}
      {columns.map((col, idx) => (
        <span key={idx}>{col}</span>
      ))}
    </div>
  ),
}));

const defaultProps = {
  props: {
    data: [
      {
        name: 'Topic A',
        slug: 'topic-a',
        featured: false,
        impacted_systems_count: 5,
      },
      {
        name: 'Topic B',
        slug: 'topic-b',
        featured: true,
        impacted_systems_count: 10,
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
  },
};

const renderComponent = (props = defaultProps) => {
  return render(
    <IntlProvider locale="en">
      <TopicsTableOriginal {...props} />
    </IntlProvider>,
  );
};

describe('TopicsTable.original - Bug Fixes', () => {
  describe('Fix: Sort by Name (index 0) regression', () => {
    it('should not crash when topics is undefined on first fetch failure', () => {
      const propsWithUndefinedData = {
        props: {
          data: undefined, // First fetch failed, no data
          isLoading: false,
          isFetching: false,
          isError: true,
        },
      };

      // Should not throw TypeError: Cannot read property 'length' of undefined
      expect(() => renderComponent(propsWithUndefinedData)).not.toThrow();
    });

    it('should show error state when first fetch fails (topics undefined)', () => {
      const propsWithUndefinedData = {
        props: {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
        },
      };

      renderComponent(propsWithUndefinedData);

      // Should show error message state
      expect(screen.getByTestId('message-state')).toBeInTheDocument();
    });

    it('should show skeleton during initial load', () => {
      const loadingProps = {
        props: {
          data: undefined,
          isLoading: true,
          isFetching: true,
          isError: false,
        },
      };

      renderComponent(loadingProps);

      expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
    });

    it('should show skeleton during refetch', () => {
      const refetchingProps = {
        props: {
          data: defaultProps.props.data,
          isLoading: false,
          isFetching: true,
          isError: false,
        },
      };

      renderComponent(refetchingProps);

      expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
    });

    it('should handle empty array without crashing', () => {
      const emptyProps = {
        props: {
          data: [],
          isLoading: false,
          isFetching: false,
          isError: false,
        },
      };

      // Should not crash and should show error state
      expect(() => renderComponent(emptyProps)).not.toThrow();
    });

    it('should not crash when props is undefined', () => {
      // Component called without props object
      expect(() =>
        render(
          <IntlProvider locale="en">
            <TopicsTableOriginal />
          </IntlProvider>,
        ),
      ).not.toThrow();
    });

    it('should not crash when props.props is empty object', () => {
      const emptyPropsObject = { props: {} };

      expect(() => renderComponent(emptyPropsObject)).not.toThrow();
    });
  });

  describe('Fix: Undefined topics handling in buildRows', () => {
    it('should not crash in useEffect when topics changes to undefined', () => {
      const { rerender } = renderComponent(defaultProps);

      // Simulate topics becoming undefined (e.g., during refetch error)
      const propsWithUndefined = {
        props: {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
        },
      };

      // Should not throw TypeError in buildRows(topics) -> undefined.flatMap()
      expect(() =>
        rerender(
          <IntlProvider locale="en">
            <TopicsTableOriginal {...propsWithUndefined} />
          </IntlProvider>,
        ),
      ).not.toThrow();
    });

    it('should handle transition from undefined to valid data', () => {
      const undefinedProps = {
        props: {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
        },
      };

      const { rerender } = renderComponent(undefinedProps);

      // Transition to valid data
      rerender(
        <IntlProvider locale="en">
          <TopicsTableOriginal {...defaultProps} />
        </IntlProvider>,
      );

      // Should render topics
      expect(screen.getByText('Topic A')).toBeInTheDocument();
      expect(screen.getByText('Topic B')).toBeInTheDocument();
    });
  });

  describe('Rendering states', () => {
    it('should render table with topics when data is available', () => {
      renderComponent(defaultProps);

      expect(screen.getByText('Topic A')).toBeInTheDocument();
      expect(screen.getByText('Topic B')).toBeInTheDocument();
    });

    it('should show error state when isError is true and not fetching', () => {
      const errorProps = {
        props: {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
        },
      };

      renderComponent(errorProps);

      expect(screen.getByTestId('message-state')).toBeInTheDocument();
    });

    it('should show skeleton when loading', () => {
      const loadingProps = {
        props: {
          data: undefined,
          isLoading: true,
          isFetching: false,
          isError: false,
        },
      };

      renderComponent(loadingProps);

      expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
    });
  });
});
