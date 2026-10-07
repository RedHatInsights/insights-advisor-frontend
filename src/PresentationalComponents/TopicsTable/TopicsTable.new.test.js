import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicsTableNew from './TopicsTable.new';

// Capture the props passed to StaticTableToolsTable so we can assert on the
// pagination options without pulling in the full bastilian-tabletools runtime.
// Prefixed with `mock` so Jest's babel-plugin-jest-hoist allows the hoisted
// jest.mock factory below to reference it.
let mockCapturedTableProps;
jest.mock('bastilian-tabletools', () => ({
  __esModule: true,
  StaticTableToolsTable: (props) => {
    mockCapturedTableProps = props;
    return <div data-testid="static-table-tools-table" />;
  },
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

const buildTopics = (count) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Topic ${i}`,
    slug: `topic-${i}`,
    featured: false,
    impacted_systems_count: i,
  }));

const renderComponent = (props) => render(<TopicsTableNew props={props} />);

beforeEach(() => {
  mockCapturedTableProps = undefined;
});

describe('TopicsTable.new - pagination handling', () => {
  it('sets perPage to the total number of topics so all rows render', () => {
    const topics = buildTopics(17);

    renderComponent({
      data: topics,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    expect(screen.getByTestId('static-table-tools-table')).toBeInTheDocument();
    expect(mockCapturedTableProps.items).toHaveLength(17);
    expect(mockCapturedTableProps.options.perPage).toBe(17);
    expect(mockCapturedTableProps.options.pagination).toBe(false);
  });

  it('does not cap perPage at the default page size of 10', () => {
    const topics = buildTopics(15);

    renderComponent({
      data: topics,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    expect(mockCapturedTableProps.options.perPage).toBeGreaterThan(10);
    expect(mockCapturedTableProps.options.perPage).toBe(topics.length);
  });

  it('keeps the default descending Featured sort', () => {
    renderComponent({
      data: buildTopics(3),
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    expect(mockCapturedTableProps.options.sortBy).toEqual({
      index: 1,
      direction: 'desc',
    });
  });
});

describe('TopicsTable.new - rendering states', () => {
  it('shows skeleton while loading', () => {
    renderComponent({
      data: [],
      isLoading: true,
      isFetching: false,
      isError: false,
    });

    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
  });

  it('shows skeleton while refetching', () => {
    renderComponent({
      data: buildTopics(3),
      isLoading: false,
      isFetching: true,
      isError: false,
    });

    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
  });

  it('shows error state when isError is true', () => {
    renderComponent({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
    });

    expect(screen.getByTestId('message-state')).toBeInTheDocument();
  });
});
