import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from "styled-components";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Web3 from 'web3';
import contract  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { getEncryptedValue } from '../../service/actions.js';
import Cookies from "universal-cookie";
import { logout } from '../../auth/logout.js';
import { getPublicKey, sendEmailOnDifferentChain, sendEmailOnSameChain } from '../../helper/email-helper.js';
import { editorConstant } from '../../constant/constant.js';
import { SendEmailLoader } from '../modal-popup/CommonAlert.js';


const cookies = new Cookies();
const contractAddress = config.json.CONTRACT;
const hexPrivateKey = config.json.KEY


const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

  const SendEmail = (props) => {
  const [htmlRender, setManageState] = useState(false);
  const [accountSettings , setAccountSettings] = useState([]);
  const [user] = useState(cookies.get("userObject"));
  const [Message , setMessageString] = useState("Send");
  const [encryptionLoader , setEncryptionLoader] = useState(false);
  const [encryptionMsg , setEncryptionMsg] = useState("Your message is encrypting...");

  const userName = user && user.name;
  const token = user && user.token;

  const networkId = config.json.NETWORK_ID;
  const web3 = new Web3(networkId);
  const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);

  useEffect(() => {

    async function fetchData(){
            try {
                const settingsJson = await contractMethods.methods.getAccountSettings(userName , token).call();
                setAccountSettings(JSON.parse(settingsJson));                    
            } catch (error) {
                console.log("error" , error)
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
    const key = await contractMethods.methods.getUserByUsername(userName).call();
    const publicKey = key.publicKey;

    const data = await getEncryptedValue(msg,publicKey);
    const encryptedMessage = data.returnValu;
    web3.eth.accounts.wallet.add(hexPrivateKey);
    
    try {
      await contractMethods.methods.saveSentEmailRequest(userName, emailObject.recipient , emailObject.subject , encryptedMessage , token).send({ from: config.json.DEFAULT_SENDER , gas: '1000000',gasPrice:1000000000 });
    } catch (error) {
      logout();
    }

    return true;
  }


  async function sendEmail(emailObject){

    setManageState(true);
   
    const isSavedOn = accountSettings.find(item => item.id === 1)?.value;    
    const domain = await contractMethods.methods.constDomain().call();    
    const receiptDomain = emailObject.recipient.split("@")[1];  
    const isSameHost = (receiptDomain === domain);

    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const hostContractMethods = new web3.eth.Contract(contract.hostContract, hostAddress);   
    
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
      
      const encryptedMessage = data.returnValu;

      props.handleCancel();

      if(encryptedMessage && isSameBlockChain){
        await sendEmailOnSameChain(emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName , userName , setEncryptionLoader);
      } else if (encryptedMessage){
        await sendEmailOnDifferentChain(emailObject , encryptedMessage , accounts , senderChainAddress , jsonValue , userName , setEncryptionLoader );
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
          const emailObject = { recipient: recipient, subject: subject, message: localStorage.getItem("sendingEmail") };

          try {
            setMessageString("Sending...")
            await sendEmail(emailObject);            
          } catch (error) {
            console.log(error); 
            setManageState(false);
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
