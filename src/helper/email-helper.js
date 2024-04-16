
import Web3 from 'web3';
import contract from '../contracts/contract.json';
import config from '../config/config.json';
import { saveEmailForDifferentHost, saveEmailOnPool, sendEmailOnSame } from '../service/actions.js';


const networkId = config.json.NETWORK_ID;
const contractAddress = config.json.CONTRACT;
const hexPrivateKey = config.json.KEY

const web3 = new Web3(networkId);
const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
const currentDate = new Date();


export const getPublicKey = async (emailObject, isSameHost, contactAddressFromName, jsonValue) => {

    try {
        let publicKey = null;
        if (isSameHost) {

            const key = await contractMethods.methods.getUserByUsername(emailObject.recipient).call();
            publicKey = key.publicKey;

        } else {
            const retrivedWeb3Value = new Web3(jsonValue.rpc_url);
            const retrivedContract = new retrivedWeb3Value.eth.Contract(contract.storageContract, contactAddressFromName);

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

export const sendEmailOnSameChain = async (emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName , userName , props) => {

  
    web3.eth.accounts.wallet.add(hexPrivateKey);
    const gasLimit = await contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage, accounts[0], currentDate.toLocaleDateString(), userName).estimateGas({ from: accounts[0] });
    const gasPrice = await web3.eth.getGasPrice();
    const transactionParameters = {
        from: accounts[0],
        to: config.json.DEFAULT_SENDER,
        gas: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        data: contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage, accounts[0], currentDate.toLocaleDateString(), userName).encodeABI()
    };

    if (isSameHost) {
        const requestObject = {
            recipient: emailObject.recipient,
            subject: emailObject.subject,
            encryptedMessage,
            senderAddress: accounts[0],
            sender: userName
        };
        await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] });
        await sendEmailOnSame(requestObject);
    } else {
        const contractMethodsData = new web3.eth.Contract(contract.storageContract, contactAddressFromName);
        transactionParameters.data = contractMethodsData.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage, accounts[0], currentDate.toLocaleDateString(), userName).encodeABI();

        await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] });
        const requestObjectValue = {
            contractAddressValue: contactAddressFromName,
            senderAddress: accounts[0],
            username: emailObject.recipient,
            subject: emailObject.subject,
            sender: userName,
            encryptedData: encryptedMessage
        };
        await saveEmailForDifferentHost(requestObjectValue);
    }
    props.reRenderIt();
    props.handleCancel();
    localStorage.setItem("sendingEmail", "");
    return true;
}

export const sendEmailOnDifferentChain = async (emailObject, encryptedMessage, accounts, senderChainAddress, jsonValue, userName, props) => {
    web3.eth.accounts.wallet.add(hexPrivateKey);
  
    const gasLimit = await contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage, accounts[0], currentDate.toLocaleDateString(), userName).estimateGas({ from: accounts[0] });
  
    // Get current gas price from the network
    const gasPrice = await web3.eth.getGasPrice();

    const transactionParameters = {
      from: accounts[0],
      to: config.json.DEFAULT_SENDER,
      gas: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPrice),
      data: contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage, accounts[0], currentDate.toLocaleDateString(), userName).encodeABI()
    };
  
    try {
      await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] });
      
    } catch (error) {
      console.log(error);
    }
  
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
  
    const requestBody = {
      requestPoolObjectValue: emailString,
      receiptDomain,
      account: accounts[0],
      poolContract: poolContractAddress
    };
  
    saveEmailOnPool(requestBody); // Saving Email on The pool contract
    props.reRenderIt();

    return true;
  };
  