// Importing the database service and Dexie library
import db from "./dbService.js";
import Dexie from 'dexie';

// Function to return email records from the database
export const returnEmailRecords = async () => {
    try {
        // Retrieving all records from the "emails" table
        let tableValue  = await db.table("emails").toArray(); 
        return tableValue;        
    } catch (error) {
        // Returning an empty array if there's an error
        return [];
    }
}

// Function to delete the entire database
export const deleteDatabase = async () => {
    // Using Dexie's delete method to delete the database
    Dexie.delete('web3Dmails').then(() => {
        // Logging success message if database is deleted successfully
        console.log("Database deleted successfully.");
    }).catch(err => {
        // Logging error message if there's an error deleting the database
        console.error("Error deleting database:", err);
    });

    return true; // Returning true indicating the delete process has started
}
