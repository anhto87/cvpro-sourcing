import _ from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
import axios from 'axios';

const generateHeaderBearToken = (headers) => {
    const token = reactLocalStorage.get('token');
    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
};

export const axiosRequest = async (url, props) => {
    const { method = 'GET', body, access_token = false } = props;

    let { headers } = props;

    if (access_token) {
        headers = generateHeaderBearToken(headers);
    }

    const baseUrl = `${process.env.REACT_APP_API_GATEWAY_URI}${url}`;

    switch (method) {
        case 'PUT':
            const responsePut = axios.post(`${baseUrl}`, body, { headers });

            return responsePut;
        case 'POST':
            const responsePost = axios.post(`${baseUrl}`, body, { headers });

            return responsePost;
        case 'GET':
            const responseGet = axios.get(`${baseUrl}`, { headers });

            return responseGet;
        default:
            return null;
    }
};

const getURl = url => `${process.env.REACT_APP_API_GATEWAY_URI}${url}`;

const requestApi = async (url, props) => {
    const {
        method = 'GET',
        timeout = 15000,
        signal = false,
        body,
        access_token = false,
        uploading_files = false,
    } = props;

    let { headers } = props;

    if (access_token) {
        headers = generateHeaderBearToken(headers);
    }

    try {
        const controller = new AbortController();
        const currentSignal = !signal ? controller.signal : signal;
        const id = setTimeout(() => {
            controller.abort();
        }, timeout);

        let optionsInit = {
            method: method,
            headers: {
                ...headers,
                Accept: 'application/json',
            },
            signal: currentSignal,
        };

        if (method === 'POST' || method === 'PUT') {
            if (uploading_files) {
                headers = {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                };
            } else {
                headers = {
                    ...headers,
                    'Content-Type': 'application/json',
                };
            }
            optionsInit = {
                ...optionsInit,
                body: body,
                headers: {
                    ...headers,
                },
            };

            console.log(optionsInit);
        }

        const response = await fetch(url, optionsInit);

        clearTimeout(id);
        if (response.ok) {
            return await response.json();
        }

        return [];
    } catch (e) {
        console.log(e);
    }
};

export const fetchApi = async (url, props) => {
    let fullUrl = getURl(url);
    return await requestApi(fullUrl, props);
};

export const fetchApiCustomURL = async (url, props) => {
    return await requestApi(url, props);
};

/**
 * Ph????ng th???c n??y s??? ki???m tra xem form hi???n t???i c?? l???i g?? kh??ng
 * @param form
 * @returns {boolean}
 */
export const formHasErrors = (form) => {
    return (
        !form.isFieldsTouched(true) ||
        !!form.getFieldsError().filter(({ errors }) => errors.length).length
    );
};

export const isTokenLogged = () => {
    const token = reactLocalStorage.get('token');

    return !_.isEmpty(token);
};
