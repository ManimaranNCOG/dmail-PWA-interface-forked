
import Web3 from 'web3';
import contractData from '../contracts/contract.json';
import config from '../config/config.json';
import { transactionAction } from './chainHelper';

const contractAddress = config.json.CONTRACT;

const web3 = new Web3(window.ethereum);
const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);
const currentDate = new Date();


export const getPublicKey = async (emailObject, isSameHost, contactAddressFromName, jsonValue) => {

    try {
        let publicKey = null;
        if (isSameHost) {
            const key = await contractMethods.methods.getUserByUsername(emailObject.recipient).call();
            publicKey = key.publicKey;
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
        const txHash = await transactionAction(contract , "sendEmailRequest", functionParams , account);   
        console.log("==========txHash=============", txHash);
        props(true);
    } else {
        const contractMethodsData = new web3.eth.Contract(contractData.storageContract, contactAddressFromName);  
        const txHash = await transactionAction(contractMethodsData , "sendEmailRequest", functionParams , account); 
        console.log("==========txHash=============", txHash);
        props(true);
    }
    return true;
}

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
    console.log("==========txHash=============", txHash);
    return txHash;
  };
  

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