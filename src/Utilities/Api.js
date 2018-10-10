import axios from 'axios';

axios.defaults.headers.common = { 'x-rh-auth-identity': '{ "identity": { "account_number": "1234567"}}' };

export default {
    get(url, headers = {}, params = {}) {
        return axios.get(url, {
            headers,
            params
        });
    },
    put(url, data = {}, headers = {}) {
        return axios.put(url, data, {
            headers
        });
    },
    post(url, data = {}, headers = {}) {
        return axios.post(url, data, {
            headers
        });
    }
};
