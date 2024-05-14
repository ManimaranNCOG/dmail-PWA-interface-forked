
import Web3 from 'web3';
import contractData from '../contracts/contract.json';
import config from '../config/config.json';
import { transactionAction } from './chain-helper';
import { validateTheWebReturedValues } from './object-validation-helper';

const contractAddress = config.json.CONTRACT;
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
export const sendEmailOnSameChain = async (emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName , userName , props , contract , account , isSavedOn=false , sentEncryptedMessage="") => {

    const functionParams = [
        emailObject.recipient,
        emailObject.subject,
        encryptedMessage,
        accounts[0],
        formattedDateTime ,
        userName , 
        isSavedOn , 
        sentEncryptedMessage
    ];

    if (isSameHost) {                   
        await transactionAction(contract , "saveEmailForUser", functionParams , account);   
        props(true);
    } else {
        const contractMethodsData = new web3.eth.Contract(contractData.storageContract, contactAddressFromName);  
        await transactionAction(contractMethodsData , "saveEmailForUser", functionParams , account); 
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

export const formatDate = (dateString) => {
    // Convert the dateString to a Date object
    const date = new Date(dateString);
    // Get the day of the week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[date.getDay()];
    // Get the month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    // Get the day of the month
    const day = date.getDate();
    // Get the hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Get the current date and time
    const currentDate = new Date();
    // Calculate the difference in milliseconds
    const difference = currentDate - date;
    // Convert milliseconds to days, hours, and minutes
    const daysAgo = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesAgo = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    // Check if the date is today
    if (daysAgo === 0) {
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes} (${hoursAgo === 0 ? minutesAgo + ' minutes ago' : hoursAgo + ' hours ago'})`;
    } else {
      return `${dayOfWeek}, ${day} ${month}, ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes} (${daysAgo === 1 ? '1 day ago' : daysAgo + ' days ago'})`;
    }
}


export const copyEmail = async (type , destinationFolderData , userName) => {

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  switch (type) {
    case "Inbox":
      const emailList = await contractMethods.methods.getEmailList(userName).call({ from: accounts[0] });

      if(emailList.length){       

        const returnEmailList = [];
        for (const email of emailList){
            const emailObject = validateTheWebReturedValues(email);
            emailObject.id = emailObject.id.toString();
            returnEmailList.push(JSON.stringify(emailObject));
        }

        const functionParams = [userName , parseInt(destinationFolderData.id) , destinationFolderData.name , destinationFolderData.date , destinationFolderData.isSearch , destinationFolderData.filterType , destinationFolderData.filterValue , returnEmailList  ];
        const txHash = await transactionAction(contractMethods , "updateFolder", functionParams , accounts[0]); 
      }

      break;
  
    default:
      break;

  }
}