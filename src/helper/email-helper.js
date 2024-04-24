
import Web3 from 'web3';
import contractData from '../contracts/contract.json';
import config from '../config/config.json';
import { transactionAction } from './chain-helper';

const contractAddress = config.json.CONTRACT;
const web3 = new Web3(window.ethereum);
const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);
const currentDate = new Date();

// Function to get public key from smartcontract asynchronously
export const getPublicKey = async (emailObject, isSameHost, contactAddressFromName, jsonValue) => {

    try {
        let publicKey = null;
        if (isSameHost) {
            publicKey = await contractMethods.methods.getPublicKeyOfUser(emailObject.recipient).call();
        } else {
            const retrivedWeb3Value = new Web3(jsonValue.rpc_url);
            const retrivedContract = new retrivedWeb3Value.eth.Contract(contractData.storageContract, contactAddressFromName);

            if (contactAddressFromName) {
                publicKey = await retrivedContract.methods.getPublicKeyOfUser(emailObject.recipient).call();
            }
        }
        return publicKey;
    } catch (error) {
        console.log(error);
        return null;
    }

} 

// Function to send email on the same blockchain chain
export const sendEmailOnSameChain = async (emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName , userName , props , contract , account) => {

    const functionParams = [
        emailObject.recipient,
        emailObject.subject,
        encryptedMessage,
        accounts[0],
        currentDate.toLocaleDateString(),
        userName
    ];
    if (isSameHost) {                   
        await transactionAction(contract , "sendEmailRequest", functionParams , account);   
        props(true);
    } else {
        const contractMethodsData = new web3.eth.Contract(contractData.storageContract, contactAddressFromName);  
        await transactionAction(contractMethodsData , "sendEmailRequest", functionParams , account); 
        props(true);
    }
    return true;
}

// Function to send email on the different blockchain chain
export const sendEmailOnDifferentChain = async (emailObject, encryptedMessage, accounts, senderChainAddress, jsonValue, userName, account) => {
  
    if (senderChainAddress["0"] && senderChainAddress["1"]) {
      jsonValue = JSON.parse(senderChainAddress["1"]);
    }
    const receiptDomain = emailObject.recipient.split("@")[1];
    const poolContractAddress = jsonValue.poolContract;
  
    const requestPoolObjectValue = {
      senderAddress: accounts[0],
      username: emailObject.recipient,
      subject: emailObject.subject,
      sender: userName,
      encryptedData: encryptedMessage
    };
  
    const emailString = JSON.stringify(requestPoolObjectValue); 
    const functionParams = [receiptDomain , emailString];
    const contractMethodsEmailPool = new web3.eth.Contract(contractData.poolContract, poolContractAddress);  
    const txHash = await transactionAction(contractMethodsEmailPool , "saveEmailsBasedOnDomain", functionParams , account); 
    return txHash;
  };
  
// Function to get public key from metamask asynchronously
  export const getPublicKeyValue = async () => {

    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length) {
            const encryptionPublicKey = await window.ethereum.request({
                method: 'eth_getEncryptionPublicKey',
                params: [accounts[0]]
            })
            return encryptionPublicKey;
        }
        return null;            
    } catch (error) {
        return null;
    }
}