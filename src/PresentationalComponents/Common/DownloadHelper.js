import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/files/helpers';

const fileName = (exportTable) => {
    const defaultParams = {
        date: new Date().toISOString().replace(/[T:]/g, '-').split('.')[0] + '-utc'
    };

    return `Insights-Advisor_${exportTable}--${defaultParams.date}`;
};

const downloadHelper = async (exportTable, format, params) => {
    try {
        const payload = await API.get(`${BASE_URL}/export/${exportTable}.${format === 'json' ? 'json' : 'csv'}${params}`);
        let data = format === 'json' ? JSON.stringify(payload.data) : payload.data;
        downloadFile(data, fileName(exportTable), format);
    } catch (error) {
        throw `${error}`;
    }
};

export default downloadHelper;
