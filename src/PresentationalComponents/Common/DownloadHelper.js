import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/helpers';

import { exportNotifications } from '../../AppConstants';
import { workloadQueryBuilder } from './Tables';
import { populateExportError } from '../helper';

const fileName = (exportTable) => {
  const defaultParams = {
    date: new Date().toISOString().replace(/[T:]/g, '-').split('.')[0] + '-utc',
  };

  return `Advisor_${exportTable}--${defaultParams.date}`;
};

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
) => {
  try {
    let options = selectedTags?.length && { tags: selectedTags };
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
