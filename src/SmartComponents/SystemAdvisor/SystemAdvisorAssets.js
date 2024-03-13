import './SystemAdvisor.scss';
import React, { useCallback } from 'react';
import { fitContent, sortable } from '@patternfly/react-table';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { AnsibeTowerIcon } from '@patternfly/react-icons';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import { ReportDetails } from '@redhat-cloud-services/frontend-components-advisor-components/ReportDetails';
import {
  FILTER_CATEGORIES as FC,
  IMPACT_LABEL,
  LIKELIHOOD_LABEL,
  RULE_CATEGORIES,
} from '../../AppConstants';
import {
  NoMatchingRecommendations,
  NoRecommendations,
  InsightsNotEnabled,
  InventoryReportFetchFailed,
} from './EmptyStates';
import { useLocation } from 'react-router-dom';

import messages from '../../Messages';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const getColumns = (intl) => [
  {
    title: intl.formatMessage(messages.topicAddEditDescription),
    transforms: [sortable],
  },
  {
    title: intl.formatMessage(messages.modified),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.firstImpacted),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.totalRisk),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.remediation),
    transforms: [sortable, fitContent],
  },
];

export const getFilters = (
  filters,
  searchValue,
  onInputChange,
  onFilterChange
) => [
  {
    label: 'description',
    type: conditionalFilterType.text,
    filterValues: {
      key: 'text-filter',
      onChange: (_e, value) => onInputChange(value),
      value: searchValue,
    },
  },
  {
    label: FC.total_risk.title,
    type: conditionalFilterType.checkbox,
    id: FC.total_risk.urlParam,
    value: `checkbox-${FC.total_risk.urlParam}`,
    filterValues: {
      key: `${FC.total_risk.urlParam}-filter`,
      onChange: (_e, values) => onFilterChange(FC.total_risk.urlParam, values),
      value: filters.total_risk,
      items: FC.total_risk.values,
    },
  },
  {
    label: FC.category.title,
    type: conditionalFilterType.checkbox,
    id: FC.category.urlParam,
    value: `checkbox-${FC.category.urlParam}`,
    filterValues: {
      key: `${FC.category.urlParam}-filter`,
      onChange: (_e, values) => onFilterChange(FC.category.urlParam, values),
      value: filters.category,
      items: FC.category.values,
    },
  },
  {
    label: FC.has_playbook.title,
    type: conditionalFilterType.checkbox,
    id: FC.has_playbook.urlParam,
    value: `checkbox-${FC.has_playbook.urlParam}`,
    filterValues: {
      key: `${FC.has_playbook.urlParam}-filter`,
      onChange: (_e, values) =>
        onFilterChange(FC.has_playbook.urlParam, values),
      value: filters.has_playbook,
      items: FC.has_playbook.values,
    },
  },
];

export const useProcessRemediation = (inventoryId) =>
  useCallback(
    (selectedAnsibleRules) => {
      const playbookRows = selectedAnsibleRules.filter(
        (r) => r.resolution?.has_playbook
      );
      const issues = playbookRows.map((r) => ({
        id: `advisor:${r.rule.rule_id}`,
        description: r.rule.description,
      }));
      return issues.length ? { issues, systems: [inventoryId] } : false;
    },
    [inventoryId]
  );

export const useBuildRows = (
  intl,
  systemAdvisorRef,
  entity,
  inventoryReportFetchStatus
) => {
  const location = useLocation().pathname?.split('/');
  return useCallback(
    (
      activeReports,
      kbaDetails,
      filters,
      rows,
      searchValue = '',
      kbaLoading = false,
      isFirstLoad = false
    ) => {
      const url = window.location.href;
      let newActiveReportsList = activeReports;
      let isRulePresent = url.indexOf('activeRule') > -1 ? true : false;
      if (isRulePresent && isFirstLoad) {
        let activeRule = location[2];
        //sorts activeReportsList by making the activeRecommendation ruleId having a higher priority when sorting, or by total_risk
        newActiveReportsList.sort((x, y) =>
          x.rule.rule_id === activeRule
            ? -1
            : y.rule.rule_id === activeRule
            ? 1
            : 0
        );
      } else if (isFirstLoad) {
        newActiveReportsList.sort((x, y) =>
          x.rule.total_risk > y.rule.total_risk
            ? -1
            : y.rule.total_risk > x.rule.total_risk
            ? 1
            : 0
        );
      }

      const builtRows = newActiveReportsList.flatMap((value, key) => {
        const rule = value.rule;
        const resolution = value.resolution;
        const kbaDetail = Object.keys(kbaDetails).length
          ? kbaDetails.filter((article) => article.id === value.rule.node_id)[0]
          : {};
        const match = rows.find((row) => row?.rule?.rule_id === rule.rule_id);
        const selected = match?.selected;
        const isOpen =
          match?.isOpen || (isRulePresent && isFirstLoad && key === 0);

        const reportRow = [
          {
            rule,
            resolution,
            //make arrow button disappear when there is no resolution
            isOpen: resolution ? isOpen : undefined,
            selected,
            disableSelection: resolution ? !resolution.has_playbook : true,
            cells: [
              {
                title: (
                  <span>
                    {rule.description} <RuleLabels rule={rule} />
                  </span>
                ),
              },
              {
                title: (
                  <span>
                    <DateFormat
                      date={rule.publish_date}
                      type="relative"
                      tooltipProps={{ position: TooltipPosition.bottom }}
                    />
                  </span>
                ),
              },
              {
                title: (
                  <div key={key}>
                    <DateFormat
                      date={value.impacted_date}
                      type="relative"
                      tooltipProps={{ position: TooltipPosition.bottom }}
                    />
                  </div>
                ),
              },
              {
                title: (
                  <div key={key} style={{ verticalAlign: 'top' }}>
                    <Tooltip
                      key={key}
                      position={TooltipPosition.bottom}
                      content={
                        <span>
                          The <strong>likelihood</strong> that this will be a
                          problem is {LIKELIHOOD_LABEL[rule.likelihood]}. The{' '}
                          <strong>impact</strong> of the problem would be &nbsp;
                          {IMPACT_LABEL[rule.impact.impact]} if it occurred.
                        </span>
                      }
                    >
                      <InsightsLabel value={rule.total_risk} isCompact />
                    </Tooltip>
                  </div>
                ),
              },
              {
                title: (
                  <div className="ins-c-center-text" key={key}>
                    {resolution === null ? (
                      intl.formatMessage(messages.notAvailable)
                    ) : resolution?.has_playbook ? (
                      <span>
                        <AnsibeTowerIcon size="sm" />{' '}
                        {intl.formatMessage(messages.playbook)}
                      </span>
                    ) : (
                      intl.formatMessage(messages.manual)
                    )}
                  </div>
                ),
              },
            ],
          },
          resolution && {
            parent: key,
            fullWidth: true,
            cells: [
              {
                title: (
                  <ReportDetails
                    key={`child-${key}`}
                    report={{
                      ...value,
                      resolution: value.resolution.resolution,
                    }}
                    kbaDetail={kbaDetail}
                    kbaLoading={kbaLoading}
                  />
                ),
              },
            ],
          },
        ];
        const isValidSearchValue =
          searchValue.length === 0 ||
          rule.description.toLowerCase().includes(searchValue.toLowerCase());
        const isValidFilterValue =
          Object.keys(filters).length === 0 ||
          Object.keys(filters)
            .map((key) => {
              const filterValues = filters[key];
              const rowValue = {
                has_playbook: value.resolution?.has_playbook,
                publish_date: rule.publish_date,
                total_risk: rule.total_risk,
                category: RULE_CATEGORIES[rule.category.name.toLowerCase()],
              };
              return filterValues.find(
                (value) => String(value) === String(rowValue[key])
              );
            })
            .every((x) => x);

        return isValidSearchValue && isValidFilterValue
          ? reportRow.filter((row) => row !== null)
          : [];
      });
      //must recalculate parent for expandable table content whenever the array size changes
      builtRows.forEach((row, index) =>
        row.parent ? (row.parent = index - 1) : null
      );

      systemAdvisorRef.current.rowCount = activeReports.length;

      if (activeReports.length < 1 || builtRows.length < 1) {
        let EmptyState =
          (builtRows.length === 0 && NoMatchingRecommendations) ||
          (entity?.insights_id && NoRecommendations) ||
          InsightsNotEnabled;

        return [
          {
            heightAuto: true,
            cells: [
              {
                props: { colSpan: 5 },
                title: <EmptyState />,
              },
            ],
          },
        ];
      }

      if (inventoryReportFetchStatus === 'failed') {
        return [
          {
            heightAuto: true,
            cells: [
              {
                props: { colSpan: 5 },
                title: <InventoryReportFetchFailed entity={entity} />,
              },
            ],
          },
        ];
      }

      return builtRows;
    },
    [entity, inventoryReportFetchStatus]
  );
};
