/**
 * Filter configurations for PathwaysTable using bastilian-tabletools.
 * Each filter defines type, label, filterAttribute, and other properties needed by TableToolsTable.
 */
import {
  FILTER_CATEGORIES as FC,
  PATHWAYS_FILTER_CATEGORIES as PFC,
} from '../../AppConstants';
import messages from '../../Messages';

/**
 * Text filter for pathway name search
 * @param {object} intl - react-intl intl object
 * @returns {object} Filter configuration
 */
export const nameFilter = (intl) => ({
  type: 'text',
  label: intl.formatMessage(messages.name),
  filterAttribute: 'text',
  id: 'text',
  urlParam: 'text',
  placeholder: intl.formatMessage(messages.filterBy),
});

/**
 * Checkbox filter for pathway categories (Availability, Performance, Security, Stability)
 * @returns {object} Filter configuration
 */
export const categoryFilter = () => ({
  type: 'checkbox',
  label: 'Category',
  filterAttribute: FC.category.urlParam,
  id: FC.category.urlParam,
  urlParam: FC.category.urlParam,
  items: FC.category.values,
});

/**
 * Checkbox filter for pathways with incident associations
 * @returns {object} Filter configuration
 */
export const incidentFilter = () => ({
  type: 'checkbox',
  label: 'Has incident',
  filterAttribute: PFC.has_incident.urlParam,
  id: PFC.has_incident.urlParam,
  urlParam: PFC.has_incident.urlParam,
  items: PFC.has_incident.values,
});

/**
 * Checkbox filter for pathways requiring system reboot
 * @returns {object} Filter configuration
 */
export const rebootFilter = () => ({
  type: 'checkbox',
  label: 'Reboot required',
  filterAttribute: PFC.reboot_required.urlParam,
  id: PFC.reboot_required.urlParam,
  urlParam: PFC.reboot_required.urlParam,
  items: PFC.reboot_required.values,
});

/**
 * Returns array of all filter configurations for PathwaysTable.
 * @param {object} intl - react-intl intl object for internationalization
 * @returns {Array} Array of filter configuration objects
 */
export default (intl) => [
  nameFilter(intl),
  categoryFilter(),
  incidentFilter(),
  rebootFilter(),
];
