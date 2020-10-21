import Qs from 'qs';
import axios from 'axios';

export default {
    get(url, headers = {}, params = {}) {
        return axios.get(url, {
            headers,
            params,
            paramsSerializer (params) {
                return Qs.stringify(params, { arrayFormat: 'repeat' });
            }

        });
    },
    put(url, data = {}, headers = {}) {
        return axios.put(url, data, {
            headers
        });
    },
    post(url, headers = {}, data = {}) {
        return axios.post(url, data, {
            headers
        });
    },
    delete(url, data = {}, headers = {}) {
        return axios.delete(url, data, {
            headers
        });
    }
};
