import React from 'react';
import PropTypes from 'prop-types';
import { Timestamp, Tooltip } from '@patternfly/react-core';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;
const year = day * 365;

const formatTime = (number, unit) =>
  `${number} ${number > 1 ? `${unit}s` : unit} ago`;

const relativeTimeTable = [
  {
    rightBound: Infinity,
    description: (diff) => formatTime(Math.round(diff / year), 'year'),
  },
  {
    rightBound: year,
    description: (diff) => formatTime(Math.round(diff / month), 'month'),
  },
  {
    rightBound: month,
    description: (diff) => formatTime(Math.round(diff / day), 'day'),
  },
  {
    rightBound: day,
    description: (diff) => formatTime(Math.round(diff / hour), 'hour'),
  },
  {
    rightBound: hour,
    description: (diff) => formatTime(Math.round(diff / minute), 'minute'),
  },
  { rightBound: minute, description: () => 'Just now' },
];

export const toRelativeTime = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const diff = Date.now() - dateObj.getTime();

  return relativeTimeTable.reduce(
    (acc, { rightBound, description }) =>
      rightBound > diff ? description(diff) : acc,
    dateObj.toUTCString().split(',')[1].slice(0, -7).trim() + ' UTC',
  );
};

export const RelativeTimeWithTooltip = ({ date, label = '' }) => {
  const dateObj = new Date(date);
  return (
    <Tooltip
      content={
        <span>
          {label}
          {dateObj.toUTCString()}
        </span>
      }
    >
      <Timestamp
        date={dateObj}
        style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
      >
        {toRelativeTime(date)}
      </Timestamp>
    </Tooltip>
  );
};

RelativeTimeWithTooltip.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  label: PropTypes.string,
};
