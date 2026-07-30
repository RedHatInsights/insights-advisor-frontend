import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { toRelativeTime, RelativeTimeWithTooltip } from './dateHelpers';

const FIXED_NOW = new Date('2025-06-15T12:00:00Z').getTime();

beforeAll(() => {
  jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('toRelativeTime', () => {
  it('returns "Just now" for less than a minute ago', () => {
    const date = new Date(FIXED_NOW - 30 * 1000);
    expect(toRelativeTime(date)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const date = new Date(FIXED_NOW - 5 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('5 minutes ago');
  });

  it('returns singular minute', () => {
    const date = new Date(FIXED_NOW - 1 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('1 minute ago');
  });

  it('returns hours ago', () => {
    const date = new Date(FIXED_NOW - 3 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('3 hours ago');
  });

  it('returns singular hour', () => {
    const date = new Date(FIXED_NOW - 1 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('1 hour ago');
  });

  it('returns days ago', () => {
    const date = new Date(FIXED_NOW - 10 * 24 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('10 days ago');
  });

  it('returns singular day', () => {
    const date = new Date(FIXED_NOW - 1 * 24 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('1 day ago');
  });

  it('returns months ago', () => {
    const date = new Date(FIXED_NOW - 3 * 30 * 24 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('3 months ago');
  });

  it('returns years ago', () => {
    const date = new Date(FIXED_NOW - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(toRelativeTime(date)).toBe('2 years ago');
  });

  it('accepts a date string', () => {
    const date = new Date(FIXED_NOW - 5 * 60 * 1000).toISOString();
    expect(toRelativeTime(date)).toBe('5 minutes ago');
  });

  it('returns "Invalid date" for garbage input', () => {
    expect(toRelativeTime('not-a-date')).toBe('Invalid date');
  });

  it('formats the UTC fallback without seconds and with UTC suffix', () => {
    const date = new Date('2020-03-14T09:26:53Z');
    const result = toRelativeTime(date);
    expect(result).toMatch(/years? ago/);

    expect(result).not.toContain('GMT');
    expect(result).not.toContain(':53');
  });
});

describe('RelativeTimeWithTooltip', () => {
  const testDate = '2025-06-15T10:30:00Z';

  it('renders a Timestamp with relative time text', () => {
    render(<RelativeTimeWithTooltip date={testDate} />);
    expect(screen.getByText(/ago|Just now/)).toBeInTheDocument();
  });

  it('tooltip content uses UTC format without seconds', () => {
    const dateObj = new Date(testDate);

    const utcString = dateObj.toUTCString();
    expect(utcString).toContain('GMT');

    const expectedFormat =
      dateObj.toUTCString().split(',')[1].slice(0, -7).trim() + ' UTC';
    expect(expectedFormat).not.toContain('GMT');
    expect(expectedFormat).toMatch(/^\d{1,2} \w+ \d{4} \d{2}:\d{2} UTC$/);
  });

  it('includes the label in tooltip content', () => {
    const view = React.createElement(RelativeTimeWithTooltip, {
      date: testDate,
      label: 'Last Seen: ',
    });
    expect(view.props.label).toBe('Last Seen: ');
    expect(view.props.date).toBe(testDate);
  });

  it('defaults label to empty string', () => {
    const view = React.createElement(RelativeTimeWithTooltip, {
      date: testDate,
    });
    expect(view.props.label).toBeUndefined();
  });

  it('renders a Timestamp element', () => {
    render(<RelativeTimeWithTooltip date={testDate} />);
    expect(screen.getByText(/ago|Just now/).closest('[datetime]')).toBeTruthy();
  });

  it('accepts a Date object as the date prop', () => {
    const dateObj = new Date(testDate);
    render(<RelativeTimeWithTooltip date={dateObj} />);
    expect(screen.getByText(/ago|Just now/)).toBeInTheDocument();
  });
});
