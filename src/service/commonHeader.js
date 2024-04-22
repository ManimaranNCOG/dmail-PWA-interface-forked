import axios from "axios";

export const commonHeaders = () =>{
    axios.defaults.headers.common['Cache-control']='no-store';
    axios.defaults.headers.common['Pragma']='no-store';
    axios.defaults.headers.common['X-XSS-Protection']=`1 mode=block`; 
    axios.defaults.headers.common['X-Content-Type-Options']='nosniff';
    axios.defaults.headers.common['Referrer-Policy']='same-origin';
    axios.defaults.headers.common['Strict-Transport-Security']=`max-age=31536000; includeSubDomains; preload`
    axios.defaults.headers.common['X-DNS-Prefetch-Control']="on";
    axios.defaults.headers.common['X-Frame-Options']='sameorigin';
    axios.defaults.headers.common['Expect-Ct']='96400'; 
    return axios.defaults.headers.common;
}
