import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/helpers';

import { exportNotifications } from '../../AppConstants';
import { workloadQueryBuilder } from './Tables';
import { populateExportError } from '../helper';

/**
 * Formats export file name with UTC timestamp.
 *
 * @param {string} exportTable - Target export table name (e.g. 'hits', 'systems').
 * @returns {string} Formatted file name string.
 */
const fileName = (exportTable) => {
  const defaultParams = {
    date: new Date().toISOString().replace(/[T:]/g, '-').split('.')[0] + '-utc',
  };

  return `Advisor_${exportTable}--${defaultParams.date}`;
};

/**
 * Triggers asynchronous export download for Advisor tables in CSV or JSON format.
 *
 * @param {string} exportTable - Name of the export dataset.
 * @param {'csv'|'json'} format - Target file format.
 * @param {Object} filters - Active local table filters.
 * @param {string[]|string} [selectedTags] - Selected tag filters.
 * @param {Object} [workloads] - Selected workload filters.
 * @param {Function} [dispatch] - Redux dispatch function.
 * @param {string} BASE_URL - Advisor API base URL.
 * @param {string} [display_name] - Optional host display name filter.
 * @param {Function} addNotification - Notification dispatch handler.
 * @param {Object} axios - Axios instance with platform interceptors.
 * @param {string[]|string} [selectedGroups] - Selected workspace / group filters.
 * @returns {Promise<void>}
 */
const downloadHelper = async (
  exportTable,
  format,
  filters,
  selectedTags,
  workloads,
  dispatch,
  BASE_URL,
  display_name,
  addNotification,
  axios,
  selectedGroups,
) => {
  try {
    let options = selectedTags?.length && { tags: selectedTags };
    if (selectedGroups?.length && !filters?.groups?.length) {
      options = {
        ...options,
        groups: Array.isArray(selectedGroups)
          ? selectedGroups.join(',')
          : selectedGroups,
      };
    }
    workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
    addNotification(exportNotifications.pending);
    const data = await axios
      .get(
        `${BASE_URL}/export/${exportTable}.${format === 'json' ? 'json' : 'csv'}`,
        {
          params: {
            ...filters,
            ...options,
            ...(display_name && { display_name: display_name }),
          },
        },
      )
      .then((result) => {
        addNotification(exportNotifications.success);
        return result;
      })
      .catch((error) => addNotification(populateExportError(error)));

    let formattedData = format === 'json' ? JSON.stringify(data) : data;
    downloadFile(formattedData, fileName(exportTable), format);
  } catch (error) {
    throw `${error}`;
  }
};

export default downloadHelper;
