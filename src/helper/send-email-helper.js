import Web3 from 'web3';
import contractData from '../contracts/contract.json';
import config from '../config/config.json';
import Cookies from "universal-cookie";
import { getPublicKey } from './email-helper';
import { getEncryptedValue, sendWebTwoEmail } from '../service/api-actions';
import { transactionAction } from './chain-helper';

const contractAddress = config.json.CONTRACT;
const cookies = new Cookies();


const userName = cookies.get("userObject");
const web3 = new Web3(window.ethereum);
const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);

const currentDateValue = new Date();
const formattedDateTime = currentDateValue.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
}) + ' ' + currentDateValue.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
});

// function to send/store email on blockchain
export const sendEmails = async (to, cc, bcc, subject, message, props , isSavedOn=false , defaultEncryptedMessage="MSG" ) => {

    // to encrypt the message.
    const [toEncryptionMessage, ccEncryptionMessage, bccEncryptionMessage] = await Promise.all([
        await getEncryptedMessageByUserArray(to, subject, message),
        await getEncryptedMessageByUserArray(cc, subject, message),
        await getEncryptedMessageByUserArray(bcc, subject, message)
    ]);

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const emailHeaderObject = {to, cc, bcc, subject};
    const emailDetails = [accounts[0], formattedDateTime, JSON.stringify(emailHeaderObject) , defaultEncryptedMessage];
    const functionParams = [subject, userName.name, isSavedOn, to, cc, bcc, toEncryptionMessage, ccEncryptionMessage, bccEncryptionMessage, emailDetails];


    const isOwnDomainPresent = await getOwnDomainBoolStatus([to, cc, bcc]);
    const isChainDomainPresent = await getChainDomainJson([to, cc, bcc]); // TODO

    if (isOwnDomainPresent) {
        props.handleCancel();
        await saveEmailForUser(accounts[0], functionParams); // send emails
    }


    for(const web2 of to){
        const status = await domainAvailableCheck(web2.split("@")[1]);
        const web2Object = [subject, userName.name, to, cc, bcc, message , []];

        if(!status){
            await sendWebTwoEmail(web2Object);
            break ;
        }
    }

    return true;
}


async function getEncryptedMessageByUserArray(userArray, subject, message) {

    let returnArray = [];
    for (let i = 0; i < userArray.length; i++) {
        const user = userArray[i];
        if(user){
            const encryptedMessage = await getEncryptedMessageByUser(user, subject, message);
            returnArray.push(encryptedMessage || "-");
        }
    }
    return returnArray;
}


async function getEncryptedMessageByUser(user, subject, message) {

    const receiptDomain = user.split("@")[1];
    const domain = await contractMethods.methods.constDomain().call();
    const isSameHost = (receiptDomain === domain);
    const obj = { recipient: user };

    const retrivedAddress = await getChainDetails(receiptDomain);
    let contactAddressFromName = null, jsonValue = null, receiptentChainId = null;

    if (retrivedAddress["0"] && retrivedAddress["1"]) {
        contactAddressFromName = retrivedAddress["0"];
        jsonValue = JSON.parse(retrivedAddress["1"]);
        receiptentChainId = jsonValue.chainId;
    }
    const publicKey = await getPublicKey(obj, isSameHost, contactAddressFromName, jsonValue);
    const emailObject = { recipient: user, subject: subject, message: message };

    if (!publicKey) return null;

    const msg = JSON.stringify(emailObject);
    const data = await getEncryptedValue(msg, publicKey);

    return data && data.returnValue;
}

async function saveEmailForUser(account, functionParams) {
    const txHash = await transactionAction(contractMethods, "sendEmailValues", functionParams, account);
    return txHash;
}


async function getChainDetails(receiptDomain) {
    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const hostContractMethods = new web3.eth.Contract(contractData.hostContract, hostAddress);
    const chainJson = await hostContractMethods.methods.getChainDetails(receiptDomain).call();
    return chainJson;
}

async function getOwnDomainBoolStatus(userArray) {

    let present = false;
    const domain = await contractMethods.methods.constDomain().call();

    for (const users of userArray) {
        for (const user of users) {
            if (user.includes(domain)) {
                present = true;
                break;
            }
        }
    }

    return present;
}

async function getChainDomainJson(userArray) {

    const hostDetails = [];
    const domain = await contractMethods.methods.constDomain().call();

    for (const users of userArray) {
        for (const user of users) {
            const userDomain = user.split("@")[1];
            if (userDomain && userDomain != domain) {
                const chainJson = await getChainDetails(userDomain);
                if (chainJson["0"] && chainJson["1"]) {
                    hostDetails.push(chainJson);
                }
            }
        }
    }

    return hostDetails;
}

async function domainAvailableCheck(userDomain){

    const chainJson = await getChainDetails(userDomain);
    if (chainJson["0"] && chainJson["1"]) {
        return true;
    }

    return false;
}