// apiActions.js
import axios from 'axios';
import {commonHeaders} from './commonHeader';
import config from '../config/config.json';                 

const BASE_URL = config["EMAIL_API"];
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
    return await fetchAPI('getEncryptValue', 'POST', { msg, key });
}

export async function login(username, connectedAddress, signature) {
    return await fetchAPI('login', 'POST', { username, connectedAddress, signature });
} 

export async function verifyToken(name){
    return await fetchAPI('verifyToken', 'POST', {name} );
}