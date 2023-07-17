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

const downloadHelper = async (
  exportTable,
  format,
  filters,
  selectedTags,
  workloads,
  SID,
  dispatch,
  display_name
) => {
  try {
    let options = selectedTags?.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
    dispatch(addNotification(exportNotifications.pending));
    const data = (
      await Get(
        `${BASE_URL}/export/${exportTable}.${
          format === 'json' ? 'json' : 'csv'
        }`,
        {},
        {
          ...filters,
          ...options,
          ...(display_name && { display_name: display_name }),
        }
      )
        .then((result) => {
          dispatch(addNotification(exportNotifications.success));
          return result;
        })
        .catch(() => dispatch(addNotification(exportNotifications.error)))
    ).data;

    let formattedData = format === 'json' ? JSON.stringify(data) : data;
    downloadFile(formattedData, fileName(exportTable), format);
  } catch (error) {
    throw `${error}`;
  }
};

export default downloadHelper;
