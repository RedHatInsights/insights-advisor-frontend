import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TableStateProvider, useStateCallbacks } from 'bastilian-tabletools';
import AdvisorTable from '../AdvisorTable/AdvisorTable';
import columns from './Columns';
import filters from './Filters';
import useRecsQuery from '../../Services/hooks/useRecsQuery';
import useAdvisorReduxFilters from '../../Utilities/hooks/useAdvisorReduxFilters';
import RuleDetailsWrapper from './RuleDetailsWrapper';
import useRulesTableActions from '../../Utilities/hooks/useRulesTableActions';
import useDisableRuleModal from '../../Utilities/hooks/useDisableRuleModal';
import DisableRule from '../Modals/DisableRule';
import { useFeatureFlag } from '../../Utilities/Hooks';

/**
 * Inner component that renders the Rules table with BaseTableToolsTable
 * Handles data fetching, expandable rows, and enable/disable actions
 */
const RulesTableInner = ({ isTabActive, pathway, topic, onRuleChange }) => {
  const isWorkloadFilterEnabled = useFeatureFlag('advisor.workloads');

  // Filter out workload filter if feature flag is disabled
  const activeFilters = isWorkloadFilterEnabled
    ? filters
    : filters.filter((f) => f.id !== 'workload');

  // Get Redux global filters merged with table-specific params
  const { additionalParams } = useAdvisorReduxFilters({ pathway, topic });

  // Get table state callbacks for reload
  const {
    current: { reload },
  } = useStateCallbacks();

  // Fetch recommendations data with table state integration
  const { data, loading, refetch } = useRecsQuery({
    useTableState: true,
    skip: !isTabActive,
    params: additionalParams,
  });

  // Add itemId for expandable rows (required by TableToolsTable)
  const items = useMemo(
    () => (data?.data || []).map((item) => ({ ...item, itemId: item.rule_id })),
    [data?.data],
  );

  // Modal and actions for enable/disable functionality
  const {
    disableRuleModal,
    handleDisableClick,
    handleModalToggle,
    handleAfterDisable,
  } = useDisableRuleModal(reload, onRuleChange, refetch);

  const { actionResolver } = useRulesTableActions({
    onDisableClick: handleDisableClick,
    onRuleChange,
    refetch,
  });

  // Table defaults with BaseTableToolsTable pattern
  const rulesDefaults = useMemo(
    () => ({
      columns,
      filters: {
        filterConfig: activeFilters,
        activeFilters: {
          status: ['enabled'], // From label "Status"
          'systems-impacted': ['true'], // From label "Systems impacted"
        },
        useReset: true,
      },
      options: {
        sortBy: { index: 3, direction: 'desc' }, // Total Risk
        detailsComponent: RuleDetailsWrapper,
        detailsProps: { fullWidth: true },
        actionResolver,
      },
    }),
    [activeFilters, actionResolver],
  );

  return (
    <>
      <AdvisorTable
        items={items}
        total={data?.meta?.total}
        defaults={rulesDefaults}
        aria-label="rules-table"
        ouiaId="rules-table"
        data-ouia-safe={!loading}
      />
      {disableRuleModal.isOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModal.isOpen}
          rule={disableRuleModal.rule}
          afterFn={handleAfterDisable}
        />
      )}
    </>
  );
};

RulesTableInner.propTypes = {
  isTabActive: PropTypes.bool,
  pathway: PropTypes.string,
  topic: PropTypes.string,
  onRuleChange: PropTypes.func,
};

/**
 * RulesTable with BaseTableToolsTable pattern
 * Features:
 * - Server-side pagination, sorting, filtering
 * - 6 columns: Name, Modified, Category, Total Risk, Systems, Remediation
 * - 12 filters: text, total_risk, res_risk, impact, likelihood, category,
 *   rule_status, systems-impacted, workload, incident, playbook, reboot
 * - Default active filters: rule_status=enabled, systems-impacted=true
 * - Expandable rows with RuleDetails
 * - Row actions: Enable/Disable recommendation
 * - Redux integration: tags, workloads
 *
 * @param {Object} props
 * @param {boolean} props.isTabActive - Whether tab is active (controls data fetching)
 * @param {string} props.pathway - Optional pathway filter
 * @param {string} props.topic - Optional topic filter
 * @param {Function} props.onRuleChange - Optional callback when rule status changes
 * @returns {React.Element}
 */
const RulesTableNew = ({ isTabActive, pathway, topic, onRuleChange }) => {
  return (
    <TableStateProvider>
      <RulesTableInner
        isTabActive={isTabActive}
        pathway={pathway}
        topic={topic}
        onRuleChange={onRuleChange}
      />
    </TableStateProvider>
  );
};

RulesTableNew.propTypes = {
  isTabActive: PropTypes.bool,
  pathway: PropTypes.string,
  topic: PropTypes.string,
  onRuleChange: PropTypes.func,
};

export default RulesTableNew;
