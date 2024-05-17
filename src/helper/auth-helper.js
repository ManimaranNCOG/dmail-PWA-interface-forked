
import Cookies from "universal-cookie";
import { login } from "../service/api-actions";
import { setCacheStorage } from "./cache-helper";
import { deleteDatabase } from "../db/dbHelper";
const cookies = new Cookies();

export async function userAuthLogin(username , contractMethods , pageType = "emails" ) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const isUserPresent = await contractMethods.methods.loginUser(username, accounts[0]).call();
    if(isUserPresent){
        const data = await login(username);   
        if(data.isAuth){
            const userObject = { name : username ,  wallet : accounts[0], token : data.token  };
            cookies.set("accessToken", data.token, { path: "/" });
            cookies.set("userObject", userObject, { path: "/" });
            setCacheStorage("loggedUser" , userObject);
            deleteDatabase();
            window.open(`/${pageType}`, "_self");
            return true;
        }
    }
    return false;
}