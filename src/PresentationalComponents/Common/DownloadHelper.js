import { BASE_URL } from '../../AppConstants';
import { Get } from '../../Utilities/Api';
import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/helpers';
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
  SID
) => {
  try {
    let options = selectedTags?.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
    const data = (
      await Get(
        `${BASE_URL}/export/${exportTable}.${
          format === 'json' ? 'json' : 'csv'
        }`,
        {},
        { ...filters, ...options }
      )
    ).data;
    let formattedData = format === 'json' ? JSON.stringify(data) : data;
    downloadFile(formattedData, fileName(exportTable), format);
  } catch (error) {
    throw `${error}`;
  }
};

export default downloadHelper;
