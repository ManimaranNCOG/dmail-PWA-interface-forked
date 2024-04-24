import Cookies from "universal-cookie";
import { deleteCacheStorage } from "../helper/cache-helper";
import { deleteDatabase } from "../db/dbHelper";
let cookies = new Cookies;


// Delete all the storage from the browser when the user logged out
export const logout = () => {    
    deleteDatabase();
    deleteCacheStorage("inbox");
    cookies.set("userObject", '', { path: "/", maxAge: 0 });
    cookies.set("accessToken", '', { path: "/", maxAge: 0 });
    window.open('/','_self');
}

