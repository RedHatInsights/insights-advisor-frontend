import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ExpandableRowContent,
  ActionsColumn,
} from '@patternfly/react-table';
import { Pagination } from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/esm/layouts/Stack/index';
import { useIntl } from 'react-intl';
import NewRuleLabels from '../Labels/NewRuleLabels';
import CategoryLabel from '../Labels/CategoryLabel';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { ruleResolutionRisk } from '../Common/Tables';
import messages from '../../Messages';
import * as AppConstants from '../../AppConstants';
import fixtures from '../../../cypress/fixtures/newrecommendations.json';
import {
  filterConfigItems,
  getActiveFiltersConfig,
  filterRules,
  sortRules,
  useUrlParams,
  handleDisableRule,
  handleEnableRule,
  getRowActions,
} from './newrulestablehelpers';
import NewEmptyState from './Components/NewEmptyState';
import useExpandable from '../../Frameworks/hooks/useExpandable';
import DisableRule from '../Modals/DisableRule';
import ViewHostAcks from '../Modals/ViewHostAcks';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import { BellSlashIcon } from '@patternfly/react-icons';
import debounce from '../../Utilities/Debounce';
import { DEBOUNCE_DELAY } from '../../AppConstants';

/**
 * NewRulesTable - PatternFly 6 presentational component for displaying recommendations table
 * Provides filtering, sorting, pagination, and expandable row details
 * @component
 * @param {Object} props - Component props
 * @param {Array} [props.rules] - Array of recommendation rule objects
 * @param {Object|boolean} [props.exportConfig] - Export configuration or false to disable
 * @param {boolean} [props.isDisableRecEnabled=false] - Whether disable/enable recommendation feature is enabled
 * @param {Function} [props.refetch] - Function to refetch data after mutations
 * @param {boolean} [props.hasEdgeDevices=false] - Whether edge devices are present (enables impacting filter)
 * @param {Object} [props.impactingFilterDef] - Filter definition for edge device systems impacted filter
 * @returns {React.Component} Rules table component with toolbar and pagination
 */
const NewRulesTable = ({
  rules = fixtures.data,
  exportConfig,
  isDisableRecEnabled = false,
  refetch = () => {},
  hasEdgeDevices = false,
  impactingFilterDef,
}) => {
  const intl = useIntl();
  const addNotification = useAddNotification();

  const {
    filters,
    setFilters,
    searchText,
    setSearchText,
    page,
    setPage,
    perPage,
    setPerPage,
    sortBy,
    setSortBy,
  } = useUrlParams();

  const [localSearchText, setLocalSearchText] = useState(searchText);
  const debouncedSearchText = debounce(localSearchText, DEBOUNCE_DELAY);

  useEffect(() => {
    setSearchText(debouncedSearchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  useEffect(() => {
    setLocalSearchText(searchText);
  }, [searchText]);

  const { isExpanded, toggleExpanded, expandAll, isAllExpanded } =
    useExpandable({ page });

  const [disableRuleOpen, setDisableRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});

  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});

  const toggleRulesDisabled = (rule_status) => {
    setFilters({ ...filters, rule_status });
  };

  const actionHandlers = {
    onDisable: (rule) =>
      handleDisableRule(rule, setSelectedRule, setDisableRuleOpen),
    onEnable: (rule) => handleEnableRule(rule, refetch, addNotification, intl),
  };

  const filterConfigItemsArray = filterConfigItems(
    filters,
    setFilters,
    localSearchText,
    setLocalSearchText,
    toggleRulesDisabled,
    intl,
  );

  const filterConfig = impactingFilterDef
    ? [...filterConfigItemsArray, impactingFilterDef]
    : filterConfigItemsArray;

  const activeFiltersConfig = getActiveFiltersConfig(
    filters,
    setFilters,
    localSearchText,
    setLocalSearchText,
    intl,
    hasEdgeDevices,
  );

  const filteredRules = useMemo(
    () => filterRules(rules, filters, searchText),
    [rules, filters, searchText],
  );

  const sortedRules = useMemo(
    () => sortRules(filteredRules, sortBy),
    [filteredRules, sortBy],
  );

  const onSort = (_event, index, direction) => {
    setSortBy({ index, direction });
  };

  const onSetPage = (_event, pageNumber) => {
    setPage(pageNumber);
  };

  const onPerPageSelect = (_event, perPageValue) => {
    setPerPage(perPageValue);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [filters, searchText]);

  const paginatedRules = sortedRules.slice(
    (page - 1) * perPage,
    (page - 1) * perPage + perPage,
  );

  return (
    <>
      {disableRuleOpen && (
        <DisableRule
          handleModalToggle={setDisableRuleOpen}
          isModalOpen={disableRuleOpen}
          rule={selectedRule}
          afterFn={refetch}
        />
      )}
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          afterFn={refetch}
          rule={viewSystemsModalRule}
        />
      )}
      <PrimaryToolbar
        filterConfig={{ items: filterConfig }}
        activeFiltersConfig={activeFiltersConfig}
        expandAll={{
          isAllExpanded,
          onClick: (_event, isOpen) => expandAll(isOpen, paginatedRules),
        }}
        pagination={{
          itemCount: sortedRules.length,
          page,
          perPage,
          onSetPage,
          onPerPageSelect,
          isCompact: true,
        }}
        exportConfig={
          exportConfig && {
            ...exportConfig,
            label: intl.formatMessage(messages.exportCsv),
            label: intl.formatMessage(messages.exportJson),
            tooltipText: intl.formatMessage(messages.exportData),
          }
        }
      />
      <Table
        aria-label="Rules table"
        ouiaId="rules-table"
        isExpandable
        isStickyHeader
        variant="compact"
      >
        <Thead>
          <Tr>
            <Th />
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 0,
              }}
            >
              Name
            </Th>
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 1,
              }}
            >
              Modified
            </Th>
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 2,
              }}
            >
              Category
            </Th>
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 3,
              }}
            >
              Total risk
            </Th>
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 4,
              }}
            >
              Systems
            </Th>
            <Th
              sort={{
                sortBy,
                onSort,
                columnIndex: 5,
              }}
            >
              Remediation type
            </Th>
            {isDisableRecEnabled && <Th />}
          </Tr>
        </Thead>
        <Tbody>
          {sortedRules.length === 0 ? (
            <Tr>
              <Td colSpan={isDisableRecEnabled ? 8 : 7}>
                <NewEmptyState
                  filters={filters}
                  toggleRulesDisabled={toggleRulesDisabled}
                />
              </Td>
            </Tr>
          ) : (
            paginatedRules.map((rule, rowIndex) => (
              <React.Fragment key={rule.rule_id}>
                <Tr isControlRow>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded: isExpanded(rule.rule_id),
                      onToggle: () => toggleExpanded(rule.rule_id),
                      expandId: 'expand-button',
                    }}
                  />
                  <Td dataLabel="Name">
                    <span>
                      <InsightsLink to={`/recommendations/${rule.rule_id}`}>
                        {rule.description}
                      </InsightsLink>{' '}
                      <NewRuleLabels rule={rule} intl={intl} isCompact />
                    </span>
                  </Td>
                  <Td dataLabel="Modified">
                    <DateFormat date={rule.publish_date} variant="relative" />
                  </Td>
                  <Td dataLabel="Category">
                    <CategoryLabel labelList={[rule.category]} />
                  </Td>
                  <Td dataLabel="Total risk">
                    <Tooltip
                      position="bottom"
                      content={
                        <>
                          The total risk of this remediation is
                          <strong>
                            {' '}
                            {
                              AppConstants.TOTAL_RISK_LABEL_LOWER[
                                rule.total_risk
                              ]
                            }
                          </strong>
                          , based on the combination of likelihood and impact to
                          remediate.
                        </>
                      }
                    >
                      <InsightsLabel value={rule.total_risk} isCompact />
                    </Tooltip>
                  </Td>
                  <Td dataLabel="Systems">
                    <InsightsLink to={`/recommendations/${rule.rule_id}`}>
                      {rule.impacted_systems_count.toLocaleString()}
                    </InsightsLink>
                  </Td>
                  <Td dataLabel="Remediation type">
                    {rule.playbook_count ? 'Playbook' : 'Manual'}
                  </Td>
                  {isDisableRecEnabled && (
                    <Td isActionCell>
                      <ActionsColumn
                        items={getRowActions(
                          rule,
                          isDisableRecEnabled,
                          intl,
                          actionHandlers,
                        )}
                      />
                    </Td>
                  )}
                </Tr>
                <Tr isExpanded={isExpanded(rule.rule_id)}>
                  <Td colSpan={isDisableRecEnabled ? 8 : 7}>
                    <ExpandableRowContent>
                      <section className="pf-v6-c-page__main-section pf-m-light">
                        <Stack hasGutter>
                          {rule.hosts_acked_count > 0 && (
                            <StackItem>
                              <BellSlashIcon size="sm" />
                              &nbsp;
                              {rule.hosts_acked_count &&
                              !rule.impacted_systems_count
                                ? intl.formatMessage(
                                    messages.ruleIsDisabledForAllSystems,
                                  )
                                : intl.formatMessage(
                                    messages.ruleIsDisabledForSystemsBody,
                                    { systems: rule.hosts_acked_count },
                                  )}
                              &nbsp;{' '}
                              <Button
                                isInline
                                variant="link"
                                ouiaId="viewSystem"
                                onClick={() => {
                                  setViewSystemsModalRule(rule);
                                  setViewSystemsModalOpen(true);
                                }}
                              >
                                {intl.formatMessage(messages.viewSystems)}
                              </Button>
                            </StackItem>
                          )}
                          <RuleDetails
                            messages={formatMessages(
                              intl,
                              RuleDetailsMessagesKeys,
                              mapContentToValues(intl, rule),
                            )}
                            product={AdvisorProduct.rhel}
                            rule={rule}
                            resolutionRisk={ruleResolutionRisk(rule)}
                            resolutionRiskDesc={
                              AppConstants.RISK_OF_CHANGE_DESC[
                                ruleResolutionRisk(rule)
                              ]
                            }
                            isDetailsPage={false}
                            showViewAffected
                            ViewAffectedLink={
                              rule.rule_status === 'enabled' && (
                                <InsightsLink
                                  to={`/recommendations/${rule.rule_id}`}
                                >
                                  {rule.impacted_systems_count === 0
                                    ? ''
                                    : intl.formatMessage(
                                        messages.viewAffectedSystems,
                                        {
                                          systems: rule.impacted_systems_count,
                                        },
                                      )}
                                </InsightsLink>
                              )
                            }
                            knowledgebaseUrl={
                              rule.node_id
                                ? `https://access.redhat.com/node/${rule.node_id}`
                                : ''
                            }
                          />
                        </Stack>
                      </section>
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              </React.Fragment>
            ))
          )}
        </Tbody>
      </Table>
      <TableToolbar isFooter>
        <Pagination
          ouiaId="page-bottom"
          itemCount={sortedRules.length}
          page={page}
          perPage={perPage}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
          widgetId="pagination-options-menu-bottom"
          variant="bottom"
        />
      </TableToolbar>
    </>
  );
};

NewRulesTable.propTypes = {
  rules: PropTypes.array,
  exportConfig: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  isDisableRecEnabled: PropTypes.bool,
  refetch: PropTypes.func,
  hasEdgeDevices: PropTypes.bool,
  impactingFilterDef: PropTypes.object,
};

export default NewRulesTable;
