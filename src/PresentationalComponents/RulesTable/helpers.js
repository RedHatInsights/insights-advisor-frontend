import React from 'react';
import { Text } from '@patternfly/react-core';
import EmptyState from './Components/EmptyState';
import { FormattedMessage } from 'react-intl';
import { paramParser } from '../Common/Tables';

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

export const urlFilterBuilder = (
  sortIndices,
  setSearchText,
  setFilters,
  filters
) => {
  let sortingValues = Object.values(sortIndices);
  const paramsObject = paramParser();
  delete paramsObject.tags;
  if (
    !sortingValues?.includes(paramsObject.sort) ||
    !sortingValues?.includes(paramsObject.sort[0]) ||
    !sortingValues?.includes(`-${paramsObject.sort[0]}`)
  ) {
    paramsObject.sort = '-total_risk';
  }
  paramsObject.text === undefined
    ? setSearchText('')
    : setSearchText(paramsObject.text);
  paramsObject.has_playbook !== undefined &&
    !Array.isArray(paramsObject.has_playbook) &&
    (paramsObject.has_playbook = [`${paramsObject.has_playbook}`]);
  paramsObject.incident !== undefined &&
    !Array.isArray(paramsObject.incident) &&
    (paramsObject.incident = [`${paramsObject.incident}`]);
  paramsObject.offset === undefined
    ? (paramsObject.offset = 0)
    : (paramsObject.offset = Number(paramsObject.offset[0]));
  paramsObject.limit === undefined
    ? (paramsObject.limit = 20)
    : (paramsObject.limit = Number(paramsObject.limit[0]));
  paramsObject.reboot !== undefined &&
    !Array.isArray(paramsObject.reboot) &&
    (paramsObject.reboot = [`${paramsObject.reboot}`]);
  paramsObject.impacting !== undefined &&
    !Array.isArray(paramsObject.impacting) &&
    (paramsObject.impacting = [`${paramsObject.impacting}`]);
  setFilters({ ...filters, ...paramsObject });
};
