import React from 'react';
import { capitalize } from '../../PresentationalComponents/Common/Tables';
import messages from '../../Messages';
import { ReportDetails } from '@redhat-cloud-services/frontend-components-advisor-components';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { AnsibeTowerIcon } from '@patternfly/react-icons';
// import { useIntl as intl } from 'react-intl';
import {
  FILTER_CATEGORIES as FC,
  IMPACT_LABEL,
  LIKELIHOOD_LABEL,
  RULE_CATEGORIES,
} from '../../AppConstants';
import { InventoryReportFetchFailed } from '../../PresentationalComponents/EmptyStates/InventoryReportFetchFailed';
import { InsightsNotEnabled } from '../../PresentationalComponents/EmptyStates/InsightsNotEnabled';
import { NoMatchingRecommendations } from '../../PresentationalComponents/EmptyStates/NoMatchingRecommendations';

export const activeRuleFirst = (activeReports, routerData) => {
  const reports = [...activeReports];
  const activeRuleIndex =
    routerData && typeof routerData.params !== 'undefined'
      ? activeReports.findIndex(
          (report) => report.rule.rule_id === routerData.params.id
        )
      : -1;
  const activeReport = reports.splice(activeRuleIndex, 1);

  return activeRuleIndex !== -1 ? [activeReport[0], ...reports] : activeReports;
};
export const processRemediation = (selectedAnsibleRules, entity) => {
  const playbookRows = selectedAnsibleRules.filter(
    (r) => r.resolution?.has_playbook
  );
  const issues = playbookRows.map((r) => ({
    id: `advisor:${r.rule.rule_id}`,
    description: r.rule.description,
  }));
  return issues.length ? { issues, systems: [entity.id] } : false;
};

export const buildFilterChips = (filters, searchValue) => {
  const prunedFilters = Object.entries(filters);
  let chips =
    filters && prunedFilters.length > 0
      ? prunedFilters.map((item) => {
          const category = FC[item[0]];
          const chips = item[1].map((value) => ({
            name: category.values.find(
              (values) => values.value === String(value)
            ).label,
            value,
          }));
          return {
            category: capitalize(category.title),
            chips,
            urlParam: category.urlParam,
          };
        })
      : [];
  searchValue.length > 0 &&
    chips.push({
      category: 'Description',
      chips: [{ name: searchValue, value: searchValue }],
    });
  return chips;
};

export const buildRows = (
  activeReports,
  kbaDetails,
  filters,
  rows,
  searchValue = '',
  kbaLoading = false,
  isFirstLoad = false,
  location,
  systemAdvisorRef,
  entity,
  intl
) => {
  const url = window.location.href;
  let newActiveReportsList = activeReports;
  let isRulePresent = url.indexOf('activeRule') > -1 ? true : false;
  if (isRulePresent) {
    let activeRule = location[2];
    //sorts activeReportsList by making the activeRecommendation ruleId having a higher priority when sorting, or by total_risk
    newActiveReportsList.sort((x, y) =>
      x.rule.rule_id === activeRule ? -1 : y.rule.rule_id === activeRule ? 1 : 0
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
    const isOpen = match?.isOpen || (isRulePresent && isFirstLoad && key === 0);

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
              <div key={key}>
                <DateFormat
                  date={rule.publish_date}
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
      (entity.insights_id && NoMatchingRecommendations) ||
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

  if (InventoryReportFetchFailed === 'failed') {
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
};
