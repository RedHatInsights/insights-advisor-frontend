import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  TableToolsTable,
  TableStateProvider,
  useStateCallbacks,
} from 'bastilian-tabletools';
import { useSelector } from 'react-redux';
import columns from './Columns';
import filters from './Filters';
import useRecsQuery from '../../Services/hooks/useRecsQuery';
import { workloadQueryBuilder } from '../Common/Tables';
import useAdvisorTableDefaults from '../../Utilities/useAdvisorTableDefaults';
import RuleDetailsWrapper from './RuleDetailsWrapper';
import useRulesTableActions from '../../Utilities/hooks/useRulesTableActions';
import useDisableRuleModal from '../../Utilities/hooks/useDisableRuleModal';
import DisableRule from '../Modals/DisableRule';

/**
 * RulesTable implementation using bastilian-tabletools (TableToolsTable - dynamic)
 *
 * Uses dynamic TableToolsTable with useRecsQuery + useTableState for:
 * - Server-side filtering via API query params
 * - Server-side sorting via API query params
 * - Server-side pagination via API offset/limit
 *
 * Features:
 * - Dynamic filtering via tabletools filter system
 * - Sorting with default: Total Risk (descending)
 * - Expandable rows with RuleDetails
 * - Enable/Disable actions via row kebab
 * - Pagination (10/20/50/100)
 *
 * @param {Object} props
 * @param {boolean} props.isTabActive - Whether tab is currently active
 * @param {Array} props.selectedTags - Selected inventory tags filter
 * @param {Object} props.workloads - Workloads filter (SAP, MSSQL, Ansible)
 * @param {string} props.pathway - Pathway filter
 * @param {Function} props.onRuleChange - Callback when rule changes
 */
const RulesTableInner = ({
  isTabActive,
  selectedTags,
  workloads,
  pathway,
  onRuleChange,
}) => {
  const advisorTableDefaults = useAdvisorTableDefaults({ columns, filters });
  const filterConfig = useMemo(
    () => ({
      filterConfig: filters,
      activeFilters: {
        rule_status: ['enabled'],
        impacting: ['true'],
      },
    }),
    [],
  );

  const {
    current: { reload },
  } = useStateCallbacks();

  const additionalParams = useMemo(() => {
    let params = {};
    if (selectedTags?.length) {
      params.tags = selectedTags.join(',');
    }
    if (workloads) {
      params = {
        ...params,
        ...workloadQueryBuilder(workloads),
      };
    }
    if (pathway) {
      params.pathway = pathway;
    }
    return params;
  }, [selectedTags, workloads, pathway]);

  const { data, loading } = useRecsQuery({
    useTableState: true,
    skip: !isTabActive,
    params: additionalParams,
  });

  const items = useMemo(
    () => (data?.data || []).map((item) => ({ ...item, itemId: item.rule_id })),
    [data?.data],
  );
  const total = data?.meta?.total;

  const {
    disableRuleModal,
    handleDisableClick,
    handleModalToggle,
    handleAfterDisable,
  } = useDisableRuleModal(reload, onRuleChange);

  const { actionResolver } = useRulesTableActions({
    onDisableClick: handleDisableClick,
    onRuleChange,
  });

  const tableOptions = useMemo(
    () => ({
      ...advisorTableDefaults,
      sortBy: { index: 3, direction: 'desc' },
      detailsComponent: RuleDetailsWrapper,
      actionResolver,
    }),
    [advisorTableDefaults, actionResolver],
  );

  return (
    <>
      <TableToolsTable
        items={items}
        total={total}
        columns={columns}
        filters={filterConfig}
        options={tableOptions}
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
  selectedTags: PropTypes.array,
  workloads: PropTypes.object,
  pathway: PropTypes.string,
  onRuleChange: PropTypes.func,
};

const RulesTableNew = ({ isTabActive, pathway, onRuleChange }) => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);

  return (
    <TableStateProvider>
      <RulesTableInner
        isTabActive={isTabActive}
        selectedTags={selectedTags}
        workloads={workloads}
        pathway={pathway}
        onRuleChange={onRuleChange}
      />
    </TableStateProvider>
  );
};

RulesTableNew.propTypes = {
  isTabActive: PropTypes.bool,
  pathway: PropTypes.string,
  onRuleChange: PropTypes.func,
};

export default RulesTableNew;
