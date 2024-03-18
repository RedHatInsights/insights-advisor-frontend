import React from 'react';
import EmptyState from './Components/EmptyState';
import { FormattedMessage } from 'react-intl';
import { paramParser } from '../Common/Tables';
import { DeleteApi } from '../../Utilities/Api';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/';
import * as AppConstants from '../../AppConstants';
import messages from '../../Messages';
import { FILTER_CATEGORIES as FC } from '../../AppConstants';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/esm/layouts/Stack/index';
import { Text } from '@patternfly/react-core';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { AnsibleTowerIcon } from '@patternfly/react-icons';
import BellSlashIcon from '@patternfly/react-icons/dist/esm/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import RuleLabels from '../Labels/RuleLabels';
import CategoryLabel from '../Labels/CategoryLabel';

import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import { ruleResolutionRisk, pruneFilters } from '../Common/Tables';
import { cellWidth, fitContent, sortable } from '@patternfly/react-table';
import { getImpactingFilterChips } from '../Filters/impactingFilter';

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

  if (Array.isArray(paramsObject.sort)) {
    if (
      !sortingValues?.includes(paramsObject.sort[0]) ||
      !sortingValues?.includes(`-${paramsObject.sort[0]}`)
    ) {
      paramsObject.sort = '-total_risk';
    }
  } else if (!sortingValues?.includes(paramsObject.sort)) {
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

export const hideReports = async (
  rowId,
  rows,
  setSelectedRule,
  setDisableRuleOpen,
  refetch,
  dispatch,
  intl
) => {
  const rule = rows[rowId].rule;
  const addNotification = (data) => dispatch(addNotificationAction(data));

  try {
    if (rule.rule_status === 'enabled') {
      setSelectedRule(rule);
      setDisableRuleOpen(true);
    } else {
      try {
        await DeleteApi(`${AppConstants.BASE_URL}/ack/${rule.rule_id}/`);
        addNotification({
          variant: 'success',
          timeout: true,
          dismissable: true,
          title: intl.formatMessage(messages.recSuccessfullyEnabled),
        });
        refetch();
      } catch (error) {
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });
      }
    }
  } catch (error) {
    addNotification({
      variant: 'danger',
      dismissable: true,
      title:
        rule.rule_status === 'enabled'
          ? intl.formatMessage(messages.rulesTableHideReportsErrorDisabled)
          : intl.formatMessage(messages.rulesTableHideReportsErrorEnabled),
      description: `${error}`,
    });
  }
};

export const removeFilterParam = (
  param,
  filters,
  setFilters,
  setSearchText
) => {
  const filter = { ...filters, offset: 0 };
  param === 'text' && setSearchText('');
  delete filter[param];
  setFilters(filter);
};

export const filterConfigItems = (
  filters,
  setFilters,
  searchText,
  setSearchText,
  toggleRulesDisabled,
  intl
) => {
  const addFilterParam = (param, values) => {
    values.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param, filters, setFilters, setSearchText);
  };

  return [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      type: conditionalFilterType.text,
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.total_risk.title,
      type: conditionalFilterType.checkbox,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    {
      label: FC.res_risk.title,
      type: conditionalFilterType.checkbox,
      id: FC.res_risk.urlParam,
      value: `checkbox-${FC.res_risk.urlParam}`,
      filterValues: {
        key: `${FC.res_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.res_risk.urlParam, values),
        value: filters.res_risk,
        items: FC.res_risk.values,
      },
    },
    {
      label: FC.impact.title,
      type: conditionalFilterType.checkbox,
      id: FC.impact.urlParam,
      value: `checkbox-${FC.impact.urlParam}`,
      filterValues: {
        key: `${FC.impact.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.impact.urlParam, values),
        value: filters.impact,
        items: FC.impact.values,
      },
    },
    {
      label: FC.likelihood.title,
      type: conditionalFilterType.checkbox,
      id: FC.likelihood.urlParam,
      value: `checkbox-${FC.likelihood.urlParam}`,
      filterValues: {
        key: `${FC.likelihood.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.likelihood.urlParam, values),
        value: filters.likelihood,
        items: FC.likelihood.values,
      },
    },
    {
      label: FC.category.title,
      type: conditionalFilterType.checkbox,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: FC.incident.title,
      type: conditionalFilterType.checkbox,
      id: FC.incident.urlParam,
      value: `checkbox-${FC.incident.urlParam}`,
      filterValues: {
        key: `${FC.incident.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.incident.urlParam, values),
        value: filters.incident,
        items: FC.incident.values,
      },
    },
    {
      label: FC.has_playbook.title,
      type: conditionalFilterType.checkbox,
      id: FC.has_playbook.urlParam,
      value: `checkbox-${FC.has_playbook.urlParam}`,
      filterValues: {
        key: `${FC.has_playbook.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.has_playbook.urlParam, values),
        value: filters.has_playbook,
        items: FC.has_playbook.values,
      },
    },
    {
      label: FC.reboot.title,
      type: conditionalFilterType.checkbox,
      id: FC.reboot.urlParam,
      value: `checkbox-${FC.reboot.urlParam}`,
      filterValues: {
        key: `${FC.reboot.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.reboot.urlParam, values),
        value: filters.reboot,
        items: FC.reboot.values,
      },
    },
    {
      label: FC.rule_status.title,
      type: conditionalFilterType.radio,
      id: FC.rule_status.urlParam,
      value: `radio-${FC.rule_status.urlParam}`,
      filterValues: {
        key: `${FC.rule_status.urlParam}-filter`,
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: FC.rule_status.values,
      },
    },
  ];
};

export const buildRows = (
  rules,
  isAllExpanded,
  setViewSystemsModalRule,
  setViewSystemsModalOpen,
  intl
) => {
  const rows = rules.data.flatMap((value, key) => [
    {
      isOpen: isAllExpanded,
      rule: value,
      cells: [
        {
          title: (
            <span key={key}>
              <Link key={key} to={`/recommendations/${value.rule_id}`}>
                {' '}
                {value.description}{' '}
              </Link>
              <RuleLabels rule={value} isCompact />
            </span>
          ),
        },
        {
          title: (
            <DateFormat
              key={key}
              date={value.publish_date}
              variant="relative"
            />
          ),
        },
        {
          title: (
            <CategoryLabel key={key} labelList={[value.category]} isCompact />
          ),
        },
        {
          title: (
            <div key={key}>
              <Tooltip
                key={key}
                position={TooltipPosition.bottom}
                content={
                  <>
                    The total risk of this remediation is
                    <strong>
                      {' '}
                      {AppConstants.TOTAL_RISK_LABEL_LOWER[value.total_risk]}
                    </strong>
                    , based on the combination of likelihood and impact to
                    remediate.
                  </>
                }
              >
                <InsightsLabel value={value.total_risk} isCompact />
              </Tooltip>
            </div>
          ),
        },
        {
          title:
            value.rule_status === 'rhdisabled' ? (
              <Tooltip
                content={intl.formatMessage(messages.byEnabling, {
                  systems: value.impacted_systems_count,
                })}
              >
                <span>{intl.formatMessage(messages.nA)}</span>
              </Tooltip>
            ) : (
              <div
                key={key}
              >{`${value.impacted_systems_count.toLocaleString()}`}</div>
            ),
        },
        {
          title: (
            <div className="ins-c-center-text " key={key}>
              {value.playbook_count ? (
                <span>
                  <AnsibleTowerIcon size="sm" />{' '}
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
    {
      parent: key * 2,
      fullWidth: true,
      cells: [
        {
          title: (
            <section className="pf-v5-c-page__main-section pf-m-light">
              <Stack hasGutter>
                {value.hosts_acked_count ? (
                  <StackItem>
                    <BellSlashIcon size="sm" />
                    &nbsp;
                    {value.hosts_acked_count && !value.impacted_systems_count
                      ? intl.formatMessage(messages.ruleIsDisabledForAllSystems)
                      : intl.formatMessage(
                          messages.ruleIsDisabledForSystemsBody,
                          { systems: value.hosts_acked_count }
                        )}
                    &nbsp;{' '}
                    <Button
                      isInline
                      variant="link"
                      ouiaId="viewSystem"
                      onClick={() => {
                        setViewSystemsModalRule(value);
                        setViewSystemsModalOpen(true);
                      }}
                    >
                      {intl.formatMessage(messages.viewSystems)}
                    </Button>
                  </StackItem>
                ) : (
                  <React.Fragment></React.Fragment>
                )}
                <RuleDetails
                  messages={formatMessages(
                    intl,
                    RuleDetailsMessagesKeys,
                    mapContentToValues(intl, value)
                  )}
                  product={AdvisorProduct.rhel}
                  rule={value}
                  resolutionRisk={ruleResolutionRisk(value)}
                  resolutionRiskDesc={
                    AppConstants.RISK_OF_CHANGE_DESC[ruleResolutionRisk(value)]
                  }
                  isDetailsPage={false}
                  showViewAffected
                  ViewAffectedLink={
                    <Link to={`/recommendations/${value.rule_id}`}>
                      {value.impacted_systems_count === 0
                        ? ''
                        : intl.formatMessage(messages.viewAffectedSystems, {
                            systems: value.impacted_systems_count,
                          })}
                    </Link>
                  }
                  knowledgebaseUrl={
                    value.node_id
                      ? `https://access.redhat.com/node/${value.node_id}`
                      : ''
                  }
                />
              </Stack>
            </section>
          ),
        },
      ],
    },
  ]);

  return rows;
};

export const getColumns = (intl) => [
  {
    title: intl.formatMessage(messages.name),
    transforms: [sortable, cellWidth(40)],
  },
  {
    title: intl.formatMessage(messages.modified),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.category),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.totalRisk),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.systems),
    transforms: [sortable, fitContent],
  },
  {
    title: intl.formatMessage(messages.remediation),
    transforms: [sortable, fitContent],
  },
];

const buildFilterChips = (filters, hasEdgeDevice) => {
  const impactingFilterChips = getImpactingFilterChips(hasEdgeDevice);

  const localFilters = { ...filters };
  delete localFilters.topic;
  delete localFilters.sort;
  delete localFilters.offset;
  delete localFilters.limit;

  return pruneFilters(localFilters, { ...FC, ...impactingFilterChips });
};

export const sortIndices = {
  1: 'description',
  2: 'publish_date',
  3: 'category',
  4: 'total_risk',
  5: 'impacted_count',
  6: 'playbook_count',
};

export const getDefaultImpactingFilter = (hasEdgeDevices) =>
  hasEdgeDevices
    ? { update_method: ['ostree', 'dnfyum'], impacting: ['true'] }
    : { impacting: ['true'] };

export const getActiveFiltersConfig = (
  filters,
  intl,
  setSearchText,
  setFilters,
  hasEdgeDevice
) => ({
  deleteTitle: intl.formatMessage(messages.resetFilters),
  filters: buildFilterChips(filters, hasEdgeDevice),
  showDeleteButton: true,
  onDelete: (_event, itemsToRemove, isAll) => {
    if (isAll) {
      setSearchText('');
      setFilters({
        ...(filters.topic && { topic: filters.topic }),
        ...getDefaultImpactingFilter(hasEdgeDevice),
        rule_status: 'enabled',
        limit: filters.limit,
        offset: filters.offset,
        pathway: filters.pathway,
      });
    } else {
      itemsToRemove.map((item) => {
        const newFilters = Object.assign({}, filters);
        if (
          item.urlParam === 'update_method' &&
          newFilters?.update_method.length === 1 &&
          Object.prototype.hasOwnProperty.call(newFilters, 'impacting')
        ) {
          delete newFilters.impacting;
        }

        const removedFilter = {
          [item.urlParam]: Array.isArray(newFilters[item.urlParam])
            ? newFilters[item.urlParam].filter(
                (value) => String(value) !== String(item.chips[0].value)
              )
            : '',
        };

        removedFilter[item.urlParam].length > 0
          ? setFilters({ ...newFilters, ...removedFilter })
          : removeFilterParam(
              item.urlParam,
              newFilters,
              setFilters,
              setSearchText
            );
      });
    }
  },
});
