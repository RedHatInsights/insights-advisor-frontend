import React from 'react';
import { Text } from '@patternfly/react-core';
import EmptyState from './Components/EmptyState';
import { FormattedMessage } from 'react-intl';

export const emptyRows = (filters, toggleRulesDisabled) => [
  {
    cells: [
      {
        title: <EmptyState {...{ filters, toggleRulesDisabled }} />,
        props: { colSpan: 6 },
      },
    ],
  },
];

export const messageMapping = () => {
  const title = <FormattedMessage id="rulestable.norulehits.title" />;

  return {
    enabled: {
      title,
      body: (
        <>
          <Text>
            <FormattedMessage id="rulestable.norulehits.enabledrulesbody" />
          </Text>
          <Text>
            <FormattedMessage id="rulestable.norulehits.enabledrulesbodysecondline" />
          </Text>
        </>
      ),
    },
    disabled: {
      title,
      body: (
        <>
          <Text>
            <FormattedMessage id="rulestable.norules.disabledrulesbody" />
          </Text>
          <Text>
            <FormattedMessage id="rulestable.norules.disabledrulesbodysecondline" />
          </Text>
        </>
      ),
    },
    rhdisabled: {
      title,
      body: (
        <Text>
          <FormattedMessage id="rulestable.norules.redhatdisabledrulesbody" />
        </Text>
      ),
    },
    default: {
      title,
      body: (
        <Text>
          <FormattedMessage id="noRecommendations" />
        </Text>
      ),
    },
  };
};
