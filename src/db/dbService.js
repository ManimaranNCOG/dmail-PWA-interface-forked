import Dexie from 'dexie';
const db = new Dexie('web3Dmails');


db.version(1).stores({
    emails: '++id, mailId, decryptedMail'
});

export default db;
