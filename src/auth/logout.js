import Cookies from "universal-cookie";
import { deleteCacheStorage } from "../helper/cacheHelper";
import db from "../db/dbService";
import { deleteDatabase } from "../db/dbHelper";
let cookies = new Cookies;


export const logout = () => {

    
    deleteDatabase();
    deleteCacheStorage("inbox");
    cookies.set("userObject", '', { path: "/", maxAge: 0 });
    cookies.set("accessToken", '', { path: "/", maxAge: 0 });
    window.open('/','_self');
}

