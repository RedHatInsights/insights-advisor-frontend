import {
  FILTER_CATEGORIES as FC,
  PATHWAYS_FILTER_CATEGORIES as PFC,
} from '../../AppConstants';

/**
 * Text filter for pathway name search
 */
export const nameFilter = {
  type: 'text',
  label: 'Name',
  filterAttribute: 'text',
  id: 'text',
  placeholder: 'Filter by name',
  filterSerialiser: (value) => {
    // Text filters come as arrays from TableToolsTable
    const textValue = Array.isArray(value) ? value[0] : value;
    return textValue ? { text: textValue } : {};
  },
};

/**
 * Checkbox filter for pathway categories (Availability, Performance, Security, Stability)
 */
export const categoryFilter = {
  type: 'checkbox',
  label: 'Category',
  filterAttribute: FC.category.urlParam,
  id: FC.category.urlParam,
  items: FC.category.values,
  filterSerialiser: (value) => {
    const categories = Array.isArray(value) ? value : [];
    return categories.length > 0 ? { category: categories } : {};
  },
};

/**
 * Checkbox filter for pathways with incident associations
 */
export const incidentFilter = {
  type: 'checkbox',
  label: 'Incidents',
  filterAttribute: PFC.has_incident.urlParam,
  id: PFC.has_incident.urlParam,
  items: PFC.has_incident.values,
  filterSerialiser: (value) => {
    const incidents = Array.isArray(value) ? value : [];
    // insights-client expects camelCase: hasIncident
    return incidents.length > 0 ? { hasIncident: incidents[0] } : {};
  },
};

/**
 * Checkbox filter for pathways requiring system reboot
 */
export const rebootFilter = {
  type: 'checkbox',
  label: 'Reboot required',
  filterAttribute: PFC.reboot_required.urlParam,
  id: PFC.reboot_required.urlParam,
  items: PFC.reboot_required.values,
  filterSerialiser: (value) => {
    const reboots = Array.isArray(value) ? value : [];
    // insights-client expects camelCase: rebootRequired
    return reboots.length > 0 ? { rebootRequired: reboots[0] } : {};
  },
};

/**
 * Returns array of all filter configurations for PathwaysTable.
 */
export default [nameFilter, categoryFilter, incidentFilter, rebootFilter];
