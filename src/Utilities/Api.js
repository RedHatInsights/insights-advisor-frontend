import axios from 'axios';

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
