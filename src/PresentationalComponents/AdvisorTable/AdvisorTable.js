import React from 'react';
import PropTypes from 'prop-types';
import { BaseTableToolsTable } from 'bastilian-tabletools';
import { useFeatureFlag } from '../../Utilities/Hooks';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from '../../Utilities/tableSerializers';

/**
 * Base table wrapper for Advisor tables using BaseTableToolsTable composition pattern.
 * Provides project-wide defaults for serializers, variant, and table options.
 *
 * **Pattern:** BaseTableToolsTable composition
 * - Separates runtime data (props) from configuration (defaults)
 * - Enables multi-layer wrapper composition
 * - Supports selective column usage via string references
 * - Prevents accidental config overrides via deep merge
 *
 * **Usage Examples:**
 *
 * @example
 * // Use all defaults
 * <AdvisorTable items={data} defaults={{ columns: [...], filters: {...} }} />
 *
 * @example
 * // Select specific columns by string reference
 * <PathwaysTable columns={['name', 'systems']} />
 *
 * @example
 * // Override specific column properties
 * <PathwaysTable columns={[{ key: 'name', title: 'Custom Title' }]} />
 *
 * @param {Object} props - Component props
 * @param {Array} props.items - Table data items
 * @param {number} props.total - Total items count for pagination
 * @param {Array} props.columns - Column selection (optional, uses defaults if not provided)
 * @param {Object} props.filters - Filter configuration (optional)
 * @param {Object} props.options - Additional table options (optional)
 * @param {Object} props.defaults - Default configurations for columns, filters, options
 * @returns {React.Element}
 */
const AdvisorTable = (props) => {
  const isDebugEnabled = useFeatureFlag('advisor.debug');

  // Project-wide defaults for all Advisor tables
  const advisorDefaults = {
    options: {
      debug: isDebugEnabled,
      serialisers: {
        pagination: paginationSerialiser,
        sort: sortSerialiser,
        filters: filtersSerialiser,
      },
      variant: 'compact',
      isStickyHeader: true,
      perPage: 20,
    },
  };

  return <BaseTableToolsTable props={props} defaults={advisorDefaults} />;
};

AdvisorTable.propTypes = {
  items: PropTypes.array,
  columns: PropTypes.array,
  total: PropTypes.number,
  filters: PropTypes.object,
  options: PropTypes.object,
  toolbarProps: PropTypes.object,
  defaults: PropTypes.shape({
    columns: PropTypes.array,
    filters: PropTypes.object,
    options: PropTypes.object,
  }),
};

export default AdvisorTable;
