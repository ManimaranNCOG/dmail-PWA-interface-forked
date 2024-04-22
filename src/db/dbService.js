// Importing the Dexie library
import Dexie from 'dexie';

// Creating a new Dexie database instance named 'web3Dmails'
const db = new Dexie('web3Dmails');

// Defining the structure of the database with a single table named 'emails'
db.version(1).stores({
    emails: '++id, mailId, decryptedMail' // 'emails' table has auto-incrementing primary key 'id' and two additional indexed fields 'mailId' and 'decryptedMail'
});

// Exporting the Dexie database instance to be used in other modules
export default db;
