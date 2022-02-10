import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/helpers';

import { BASE_URL, exportNotifications } from '../../AppConstants';
import { Get } from '../../Utilities/Api';
import { workloadQueryBuilder } from '../Common/Tables';

const fileName = (exportTable) => {
  const defaultParams = {
    date: new Date().toISOString().replace(/[T:]/g, '-').split('.')[0] + '-utc',
  };

  return `Insights-Advisor_${exportTable}--${defaultParams.date}`;
};

function objectsToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr);
  return array
    .map((row) => {
      return Object.values(row)
        .map((value) => {
          return typeof value === 'string' ? JSON.stringify(value) : value;
        })
        .toString();
    })
    .join('\n');
}

const downloadHelper = async (
  exportTable,
  format,
  filters,
  selectedTags,
  workloads,
  SID,
  overrideData,
  dispatch
) => {
  try {
    let data;
    if (overrideData) {
      data = format === 'json' ? overrideData : objectsToCSV(overrideData);
    } else {
      let options = selectedTags?.length && { tags: selectedTags };
      workloads &&
        (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
      dispatch(addNotification(exportNotifications.pending));
      data = (
        await Get(
          `${BASE_URL}/export/${exportTable}.${
            format === 'json' ? 'json' : 'csv'
          }`,
          {},
          { ...filters, ...options }
        )
          .then((result) => {
            dispatch(addNotification(exportNotifications.success));
            return result;
          })
          .catch(() => dispatch(addNotification(exportNotifications.error)))
      ).data;
    }
    let formattedData = format === 'json' ? JSON.stringify(data) : data;
    downloadFile(formattedData, fileName(exportTable), format);
  } catch (error) {
    throw `${error}`;
  }
};

export default downloadHelper;
