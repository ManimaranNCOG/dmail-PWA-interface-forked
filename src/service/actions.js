// apiActions.js
import axios from 'axios';
import {commonHeaders} from './commonHeader';
import config  from '../config/config.json';
const BASE_URL = config.json.EMAIL_API;

commonHeaders();

async function fetchAPI(endpoint, method, body) {
    try {
        const response = await axios({
            method: method,
            url: `${BASE_URL}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: body
        });
        return response.data;
    } catch (error) {
        return null;
    }
}
export async function getEncryptedValue(msg, key) {
    return await fetchAPI('getEncrypValue', 'POST', { msg, key });
}

export async function createAccount(requestObject) {
    const result = await fetchAPI('create-account', 'POST', requestObject );
    return result;
}

export async function login(username, connectedAddress, signature) {
    return await fetchAPI('login', 'POST', { username, connectedAddress, signature });
}

export async function sendEmailOnSame(requestObject) {  
    return await fetchAPI('sendEmailOnSame', 'POST', requestObject );
}

export async function saveEmailForDifferentHost(object) {
    return await fetchAPI('saveEmailForDifferentHost', 'POST', object );
}

export async function markEmailAsRead(object) {
    return await fetchAPI('markEmailAsRead', 'POST', object );
}   

export async function verifyToken(name){
    return await fetchAPI('verifyToken', 'POST', {name} );
}

export async function saveEmailOnPool(obj){
    return await fetchAPI('saveEmailOnPool', 'POST', obj );
}