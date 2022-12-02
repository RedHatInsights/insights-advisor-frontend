import React from 'react';
import { Text } from '@patternfly/react-core';
import EmptyState from './Components/EmptyState';
import { FormattedMessage } from 'react-intl';
import messages from '../../Messages';
import { Link } from 'react-router-dom';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/js/layouts/Stack/index';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';
import AnsibeTowerIcon from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CategoryLabel from '../Labels/CategoryLabel';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import {
  formatMessages,
  mapContentToValues,
  strong,
} from '../../Utilities/intlHelper';
import RuleLabels from '../Labels/RuleLabels';
import * as AppConstants from '../../AppConstants';
import { ruleResolutionRisk } from '../Common/Tables';
import { FILTER_CATEGORIES as FC } from '../../AppConstants';

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

export const ruleRows = (
  rules,
  isAllExpanded,
  intl,
  setViewSystemsModalRule,
  setViewSystemsModalOpen
) => {
  let rows = rules.data.flatMap((value, key) => [
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
                content={intl.formatMessage(
                  messages.rulesDetailsTotalRiskBody,
                  {
                    risk:
                      AppConstants.TOTAL_RISK_LABEL_LOWER[value.total_risk] ||
                      intl.formatMessage(messages.undefined),
                    strong: (str) => strong(str),
                  }
                )}
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
    {
      parent: key * 2,
      fullWidth: true,
      cells: [
        {
          title: (
            <Main className="pf-m-light">
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
                  linkComponent={Link}
                  knowledgebaseUrl={
                    value.node_id
                      ? `https://access.redhat.com/node/${value.node_id}`
                      : ''
                  }
                />
              </Stack>
            </Main>
          ),
        },
      ],
    },
  ]);
  return rows;
};

export const ruelsFilterConfig = (
  intl,
  searchText,
  setSearchText,
  addFilterParam,
  filters,
  toggleRulesDisabled
) => {
  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
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
      type: FC.res_risk.type,
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
      type: FC.impact.type,
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
      type: FC.likelihood.type,
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
      type: FC.category.type,
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
      type: FC.incident.type,
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
      type: FC.has_playbook.type,
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
      type: FC.reboot.type,
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
      type: FC.rule_status.type,
      id: FC.rule_status.urlParam,
      value: `radio-${FC.rule_status.urlParam}`,
      filterValues: {
        key: `${FC.rule_status.urlParam}-filter`,
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: FC.rule_status.values,
      },
    },
    {
      label: FC.impacting.title,
      type: FC.impacting.type,
      id: FC.impacting.urlParam,
      value: `checkbox-${FC.impacting.urlParam}`,
      filterValues: {
        key: `${FC.impacting.urlParam}-filter`,
        onChange: (e, values) => addFilterParam(FC.impacting.urlParam, values),
        value: filters.impacting,
        items: FC.impacting.values,
      },
    },
  ];
  return filterConfigItems;
};
