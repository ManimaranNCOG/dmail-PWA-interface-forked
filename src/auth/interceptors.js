import axios from 'axios';
import Cookies from "universal-cookie";
export async function setHeaderToken(){
    axios.interceptors.request.use(function (config) {
        const cookies = new Cookies;
        const token = cookies.get("accessToken");

        if(token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    axios.interceptors.response.use(
    (response) => {
        return response;
    },
    function (error) {
        console.log("error", error);
               
    })
} 