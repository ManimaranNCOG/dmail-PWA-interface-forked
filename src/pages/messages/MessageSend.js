import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from "styled-components";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Web3 from 'web3';
import contract  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { getEncryptedValue, saveEmailForDifferentHost, saveEmailOnPool, sendEmailOnSame } from '../../service/actions';
import Cookies from "universal-cookie";
import { logout } from '../../auth/logout.js';

const cookies = new Cookies();
const contractAddress = config.json.CONTRACT;
const hexPrivateKey = config.json.KEY


const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

  const MessageSend = (props) => {
  const [htmlRender, setManageState] = useState(false);
  const [accountSettings , setAccountSettings] = useState([]);
  const [hostContract , setContractAddress] = useState("");
  const [currentDate] = useState(new Date());
  const [user] = useState(cookies.get("userObject"));


  const userName = user && user.name;
  const token = user && user.token;

  const networkId = config.json.NETWORK_ID;
  const web3 = new Web3(networkId);
  const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
  const domain = userName.split("@")[userName.split("@").length-1];


  useEffect(() => {

    async function fetchData(){            
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            try {
                const settingsJson = await contractMethods.methods.getAccountSettings(userName , accounts[0]).call();
                setAccountSettings(JSON.parse(settingsJson));                    
            } catch (error) {
                return true;
            }
    }

    const inputElement = document.getElementById('receiver');
    const subjectElement = document.getElementById('subject');
  
    if (inputElement) {
      inputElement.value = ''; // Clearing the input value
      subjectElement.value = ''; // Clearing the input value
    }

    fetchData()
  }, []); 


    // This useEffect will re-run whenever contractAddress changes
    useEffect(() => {
      // Your logic to handle re-render after contractAddress update
      // For example:
      console.log('Contract address updated:', contractAddress);
  }, [contractAddress]);


  const Editor = ({ placeholder }) => {
    const [editorHtml, setEditorHtml] = useState(localStorage.getItem("sendingEmail") || "");
    const [theme] = useState('snow');
    localStorage.setItem("sendingEmail", editorHtml)
    return (
      <div>
        <ReactQuill
          theme={theme}
          onChange={setEditorHtml}
          value={editorHtml}
          modules={Editor.modules}
          formats={Editor.formats}
          placeholder={placeholder}
        />
      </div>
    );
  };

  Editor.propTypes = {
    placeholder: PropTypes.string,
  };

  Editor.modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video', 'file'],
      ['clean']
    ],
  };

  Editor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];


  async function saveSenderEncryptedEmail(emailObject){

    const msg = JSON.stringify(emailObject);
    const key = await contractMethods.methods.getUserByUsername(userName).call();
    const publicKey = key.publicKey;

    const data = await getEncryptedValue(msg,publicKey);
    const encryptedMessage = data.returnValu;

    web3.eth.accounts.wallet.add(hexPrivateKey);
    try {
      contractMethods.methods.saveSentEmailRequest(userName, emailObject.recipient , emailObject.subject , encryptedMessage , token).send({ from: config.json.DEFAULT_SENDER , gas: '1000000',gasPrice:1000000000 });
    } catch (error) {
      logout();
    }
  }



  async function sendEmailOnSameChain(emailObject , encryptedMessage , accounts  ,isSameHost , contactAddressFromName ){

    web3.eth.accounts.wallet.add(hexPrivateKey);
    const gasLimit = await contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage , accounts[0] ,currentDate.toLocaleDateString() , userName).estimateGas({ from: accounts[0] });
    // Get current gas price from the network
    const gasPrice = await web3.eth.getGasPrice();
     // Sign the transaction with MetaMask
     const transactionParameters = {   from: accounts[0],  to: config.json.DEFAULT_SENDER,  gas: web3.utils.toHex(gasLimit), gasPrice: web3.utils.toHex(gasPrice),  data: contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage , accounts[0] ,currentDate.toLocaleDateString() , userName).encodeABI() };

    if(isSameHost){
      const requestObject = { recipient : emailObject.recipient , subject : emailObject.subject , encryptedMessage , senderAddress : accounts[0]  , sender : userName };
      await window.ethereum.request({  method: 'eth_sendTransaction',   params: [transactionParameters]  });
      await sendEmailOnSame(requestObject);
      props.reRenderIt();
    }else{
      const contractMethodsData = new web3.eth.Contract(contract.storageContract, contactAddressFromName);
      transactionParameters.data = contractMethodsData.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage , accounts[0] ,currentDate.toLocaleDateString() , userName).encodeABI();
      
      await window.ethereum.request({   method: 'eth_sendTransaction', params: [transactionParameters]   });
      const requestObjectValue = {  contractAddressValue : contactAddressFromName,  senderAddress : accounts[0] , username : emailObject.recipient, subject : emailObject.subject ,  sender : userName ,  encryptedData : encryptedMessage  }
      await saveEmailForDifferentHost(requestObjectValue);

      props.reRenderIt();
    }        
    props.handleCancel();
    localStorage.setItem("sendingEmail", "");

    return true;
  }


  async function sendEmailOnDifferentChain(emailObject , encryptedMessage , accounts , senderChainAddress ,jsonValue ){
    
    web3.eth.accounts.wallet.add(hexPrivateKey);
    const gasLimit = await contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage , accounts[0] ,currentDate.toLocaleDateString() , userName).estimateGas({ from: accounts[0] });
    // Get current gas price from the network
    const gasPrice = await web3.eth.getGasPrice();
    const transactionParameters = {  from: accounts[0],  to: config.json.DEFAULT_SENDER,   gas: web3.utils.toHex(gasLimit),  gasPrice: web3.utils.toHex(gasPrice), data: contractMethods.methods.sendEmailRequest(emailObject.recipient, emailObject.subject, encryptedMessage , accounts[0] ,currentDate.toLocaleDateString() , userName).encodeABI() };

    try {          
      await window.ethereum.request({  method: 'eth_sendTransaction',  params: [transactionParameters]  });
    } catch (error) {
      console.log(error)
    }
    
    if(senderChainAddress["0"] &&  senderChainAddress["1"]){
      jsonValue = JSON.parse(senderChainAddress["1"]);
    }  
    const receiptDomain = emailObject.recipient.split("@")[1];  
    const poolContractAddress = jsonValue.poolContract;
    const requestPoolObjectValue = { senderAddress : accounts[0] ,  username : emailObject.recipient,  subject : emailObject.subject , sender : userName , encryptedData : encryptedMessage  }
    const emailString = JSON.stringify(requestPoolObjectValue);
    const requestBody = {   requestPoolObjectValue : emailString ,   receiptDomain ,   account : accounts[0]  ,   poolContract : poolContractAddress  }
    saveEmailOnPool(requestBody); // Saving Email on The pool contract
    props.reRenderIt();
    return true;
  }

  async function sendEmail(emailObject){

    const isSavedOn = accountSettings.find(item => item.id === 1)?.value;    
    const domain = await contractMethods.methods.constDomain().call();    
    const receiptDomain = emailObject.recipient.split("@")[1];  
    const isSameHost = (receiptDomain === domain);

    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const hostContractMethods = new web3.eth.Contract(contract.hostContract, hostAddress);   
    const retrivedAddress = await hostContractMethods.methods.getChainDetails(receiptDomain).call();
    const senderChainAddress = await hostContractMethods.methods.getChainDetails(domain).call();

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    let contactAddressFromName = null;
    let jsonValue = null;
    const loggedChainId = await web3.eth.net.getId();
    let receiptentChainId = null;
  
    if(retrivedAddress["0"] &&  retrivedAddress["1"]){
      contactAddressFromName = retrivedAddress["0"];
      jsonValue = JSON.parse(retrivedAddress["1"]);
      receiptentChainId = jsonValue.chainId;
    }  
    const isSameBlockChain = (receiptentChainId === parseInt(loggedChainId));

    if(isSavedOn){
      saveSenderEncryptedEmail(emailObject , accounts);
    }

    let publicKey = null ;
    if(isSameHost){
      const key = await contractMethods.methods.getUserByUsername(emailObject.recipient).call();
      publicKey = key.publicKey;
    }else{
      const retrivedWeb3Value = new Web3(jsonValue.rpc_url);
      const retrivedContract = new retrivedWeb3Value.eth.Contract(contract.storageContract, contactAddressFromName);    

      if(contactAddressFromName){
        publicKey = await retrivedContract.methods.getPublicKeyOfUser(emailObject.recipient).call();
      }
    }

    // Encrypt The data here
    if(publicKey && publicKey != "null"){
      setManageState(true);
      const key = publicKey ;    
      const msg = JSON.stringify(emailObject);
      const data = await getEncryptedValue(msg,key);
      const encryptedMessage = data.returnValu;

      if(encryptedMessage && isSameBlockChain){
        await sendEmailOnSameChain(emailObject , encryptedMessage , accounts  ,isSameHost , contactAddressFromName);
      } else if (encryptedMessage){
        await sendEmailOnDifferentChain(emailObject , encryptedMessage , accounts , senderChainAddress , jsonValue );
      }
    }else{
      return false;
    }

    setManageState(false);

    const inputElement = document.getElementById('receiver');
    const subjectElement = document.getElementById('subject');
  
    if (inputElement) {
      inputElement.value = ''; // Clearing the input value
      subjectElement.value = ''; // Clearing the input value
    }

  }

  return (
    <div className='email-to-from-element'>
      <div className='email-to-from-common'>
        <div className='to-element'>
          <div className='box-elememt'> To </div>
          <input id="receiver" placeholder='' />
          <div className='cc'> Cc </div>
          <div className='bcc'> Bcc </div>
        </div>
        <input id="subject" className="input-class-common" placeholder='Add a Subject' />
      </div>

      <Editor placeholder="Write something..." />
      <div className="common-footer-ele btn-footer-email-compose">
        <button className="send-btn-mail" onClick={async (e) => {
          const recipient = document.getElementById("receiver").value;
          const subject = document.getElementById("subject").value;
          const emailObject = { recipient: recipient, subject: subject, message: localStorage.getItem("sendingEmail") };
          await sendEmail(emailObject);
        }} >
                    {htmlRender ? "Sending..." : <ComposeIcon /> }  {htmlRender ? "" : "Send" }  
        </button>
      </div>

    </div>
  );
};

export default MessageSend;
