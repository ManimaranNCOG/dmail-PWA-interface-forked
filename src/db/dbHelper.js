import db from "./dbService.js";
import Dexie from 'dexie';

export const returnEmailRecords = async () => {

    try {
        let tableValue  = await db.table("emails").toArray(); 
        return tableValue;        
    } catch (error) {
        return [];
    }

}


export const deleteDatabase = async () => {

    Dexie.delete('web3Dmails').then(() => {
        console.log("Database deleted successfully.");
    }).catch(err => {
        console.error("Error deleting database:", err);
    });

    return true;
}