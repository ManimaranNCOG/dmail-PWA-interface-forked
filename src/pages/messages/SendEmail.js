import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from "styled-components";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Web3 from 'web3';
import contractData  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { getEncryptedValue } from '../../service/actions.js';
import Cookies from "universal-cookie";
import { logout } from '../../auth/logout.js';
import { getPublicKey, sendEmailOnDifferentChain, sendEmailOnSameChain } from '../../helper/email-helper.js';
import { editorConstant } from '../../constant/constant.js';
import { SendEmailLoader } from '../modal-popup/CommonAlert.js';
import { transactionAction } from '../../helper/chainHelper.js';


const cookies = new Cookies();
const contractAddress = config.json.CONTRACT;


const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

  const SendEmail = (props) => {
  const [htmlRender, setManageState] = useState(false);
  const [accountSettings , setAccountSettings] = useState([]);
  const [user] = useState(cookies.get("userObject"));
  const [Message , setMessageString] = useState("Send");
  const [encryptionLoader , setEncryptionLoader] = useState(false);
  const [encryptionMsg , setEncryptionMsg] = useState("Your message is encrypting...");


  const [web3Value, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);

  const userName = user && user.name;

  const networkId = config.json.NETWORK_ID;
  const web3 = new Web3(window.ethereum);
  const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);


  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
    const web3Instance = new Web3(window.ethereum);
    setWeb3(web3Instance);

    // Check if user is already connected
    window.ethereum
        .request({ method: 'eth_accounts' })
        .then(accounts => {
        if (accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
        }
        })
        .catch(err => console.error(err));

    // Listen for account changes
    window.ethereum.on('accountsChanged', accounts => {
        setIsConnected(accounts.length > 0);
        setAccount(accounts[0] || '');
    });
    } else {
    console.log('MetaMask is not installed');
    }

    return () => {
      localStorage.setItem("sendingEmail", "");
    };
}, []);



useEffect(() => {
  async function fetchdata(){
    // Initialize contract instance
    const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);      
    setContract(contractInstance);  

    try {
      const settingsJson = await contractInstance.methods.getAccountSettings(userName).call();
      setAccountSettings(JSON.parse(settingsJson));                    
    } catch (error) {
        console.log("error" , error)
        return true;
    }

  }
  if (web3Value) {
      fetchdata();
  }

  
  const inputElement = document.getElementById('receiver');
  const subjectElement = document.getElementById('subject');

  if (inputElement) {
    inputElement.value = ''; // Clearing the input value
    subjectElement.value = ''; // Clearing the input value
  }

}, [web3Value]);





  const Editor = ({ placeholder }) => {
    const [editorHtml, setEditorHtml] = useState(localStorage.getItem("sendingEmail")||"");
    const [theme] = useState('snow');

    localStorage.setItem("sendingEmail", editorHtml);
    
    return (
      <div>
        <ReactQuill theme={theme}  onChange={setEditorHtml}  value={editorHtml} modules={Editor.modules} formats={Editor.formats} placeholder={placeholder}  />
      </div>
    );
  };

  // textbox editor spec
  Editor.propTypes = {  placeholder: PropTypes.string };
  Editor.modules = { toolbar: editorConstant.toolBar  };
  Editor.formats = editorConstant.format;


  async function saveSenderEncryptedEmail(emailObject){

    const msg = JSON.stringify(emailObject);
    const publicKey = await contract.methods.getPublicKeyOfUser(userName).call();

    const data = await getEncryptedValue(msg,publicKey);
    const encryptedMessage = data.returnValue;

    const functionParams = [userName, emailObject.recipient , emailObject.subject , encryptedMessage];
    const txHash = await transactionAction(contract , "saveSentEmailRequest", functionParams , account);  
    return txHash;
  }


  async function sendEmail(emailObject){

    setManageState(true);
   
    const isSavedOn = accountSettings.find(item => item.id === 1)?.value;    
    const domain = await contractMethods.methods.constDomain().call();    
    const receiptDomain = emailObject.recipient.split("@")[1];  
    const isSameHost = (receiptDomain === domain);

    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const hostContractMethods = new web3.eth.Contract(contractData.hostContract, hostAddress);   
    
    setMessageString("Sending...");
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const loggedChainId = await web3.eth.net.getId();
    
    const retrivedAddress = await hostContractMethods.methods.getChainDetails(receiptDomain).call();
    const senderChainAddress = await hostContractMethods.methods.getChainDetails(domain).call();

    let contactAddressFromName = null , jsonValue = null , receiptentChainId = null;
  
    if(retrivedAddress["0"] &&  retrivedAddress["1"]){
      contactAddressFromName = retrivedAddress["0"];
      jsonValue = JSON.parse(retrivedAddress["1"]);
      receiptentChainId = jsonValue.chainId;
    }
    
    const isSameBlockChain = (receiptentChainId === parseInt(loggedChainId));

    if(isSavedOn) saveSenderEncryptedEmail(emailObject , accounts);
    const publicKey = await getPublicKey(emailObject, isSameHost, contactAddressFromName, jsonValue);

    // Encrypt The data here
    if(publicKey && publicKey != "null"){
      setManageState(true);
      const key = publicKey ;    
      const msg = JSON.stringify(emailObject);
      const data = await getEncryptedValue(msg,key);
      
      const encryptedMessage = data.returnValue;

      props.handleCancel();

      if(encryptedMessage && isSameBlockChain){
        await sendEmailOnSameChain(emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName , userName , setEncryptionLoader , contract ,  account);
      } else if (encryptedMessage){
        await sendEmailOnDifferentChain(emailObject , encryptedMessage , accounts , senderChainAddress , jsonValue , userName , account );
      }

      setEncryptionMsg("Message Sent");
      setTimeout(() => {
        setManageState(false);
        setEncryptionLoader(false)
        props.reRenderIt();
        props.handleCancel();      
        setMessageString("Send");
        setEncryptionMsg("")
        localStorage.setItem("sendingEmail", "");
      }, 1000); 

    }else{
      setManageState(false);
      setMessageString("Send");
      return false;
    }
    

    setTimeout(() => {

      const modalMask = document.querySelector('.ant-modal-mask');
      const modalParentDiv = document.querySelector('.with-sidebar-comp');

      if (modalMask) modalMask.classList.remove('SendEmailLoader');
      if (modalParentDiv) modalParentDiv.classList.remove('SendEmailLoader');
      
      setEncryptionMsg("Your message is encrypting...");  
    }, 1000);

    
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
          const emails = recipient.split(",");
          
          for(let email of emails){
            const emailObject = { recipient: email.replace(/\s/g, ''), subject: subject, message: localStorage.getItem("sendingEmail") };  
            try {
              setMessageString("Sending...")
              await sendEmail(emailObject);            
            } catch (error) {
              console.log(error); 
              setManageState(false);
            }
          }
        }} >
            {htmlRender ? "" : <ComposeIcon /> }  {htmlRender ? Message : Message }  
        </button>
      </div>

        <SendEmailLoader isOpen={encryptionLoader} msg={encryptionMsg} />
    </div>
  );
};

export default SendEmail;
