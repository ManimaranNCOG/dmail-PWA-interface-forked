import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from "styled-components";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Web3 from 'web3';
import contractData from '../../contracts/contract.json';
import config from '../../config/config.json';
import { getEncryptedValue, sendWebTwoEmail } from '../../service/api-actions.js';
import Cookies from "universal-cookie";
import { getPublicKey, sendEmailOnDifferentChain, sendEmailOnSameChain } from '../../helper/email-helper.js';
import { editorConstant } from '../../constant/constant.js';
import { SendEmailLoader } from '../modal-popup/CommonAlert.js';
import { transactionAction } from '../../helper/chain-helper.js';
import { sendEmails } from '../../helper/send-email-helper.js';
import { web3AccountCheck } from '../../helper/web3-helper.js';


const cookies = new Cookies();
const contractAddress = config.json.CONTRACT;


const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

const SendEmail = (props) => {
  const [htmlRender, setManageState] = useState(false);
  const [accountSettings, setAccountSettings] = useState([]);
  const [user] = useState(cookies.get("userObject"));
  const [Message, setMessageString] = useState("Send");
  const [encryptionLoader, setEncryptionLoader] = useState(false);
  const [encryptionMsg, setEncryptionMsg] = useState("Your message is encrypting...");
  const [web3Value, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [senderAddress, setSenderAddress] = useState([]);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [selectedOption, setSelectedOption] = useState(''); // State to manage selected option
  const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility
  const [toEmail, setTomail] = useState(props.toEmail || "");


  const userName = user && user.name;
  const web3 = new Web3(window.ethereum);
  const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);


  useEffect(() => {
    // Check if MetaMask is installed    
    if (window.ethereum) {
      web3AccountCheck(setWeb3 , setAccount);
    } else {
      console.log('MetaMask is not installed');
    }
    setTomail(props.toEmail);

    return () => {
      localStorage.setItem("sendingEmail", "");
    };
  }, []);

  useEffect(() => {
    setTomail(props.toEmail);
  }, [props.toEmail]);


  useEffect(() => {
    async function fetchdata() {
      // Initialize contract instance
      const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);
      setContract(contractInstance);
      try {
        const settingsJson = await contractInstance.methods.getAccountSettings(userName).call();
        setAccountSettings(JSON.parse(settingsJson));
      } catch (error) {
        // return true;
      }
      try {
        const allAddresses = await contractInstance.methods.getAddressBookForUser(userName).call();
        setSenderAddress(allAddresses);
      } catch (error) {
        return true;
      }
    }
    if (web3Value) {
      fetchdata();
    }
    clear(true);
  }, [web3Value]);


  // compose editor
  const Editor = ({ placeholder }) => {
    const [editorHtml, setEditorHtml] = useState(localStorage.getItem("sendingEmail") || "");
    const [theme] = useState('snow');
    localStorage.setItem("sendingEmail", editorHtml);

    return (
      <div>
        <ReactQuill theme={theme} onChange={setEditorHtml} value={editorHtml} modules={Editor.modules} formats={Editor.formats} placeholder={placeholder} />
      </div>
    );
  };

  // textbox editor spec
  Editor.propTypes = { placeholder: PropTypes.string };
  Editor.modules = { toolbar: editorConstant.toolBar };
  Editor.formats = editorConstant.format;


  async function saveSenderEncryptedEmail(emailObject) { // Save sent items

    const msg = JSON.stringify(emailObject);
    const publicKey = await contract.methods.getPublicKeyOfUser(userName).call();

    const data = await getEncryptedValue(msg, publicKey);
    const encryptedMessage = data.returnValue;

    return encryptedMessage;
  }


  // function to send email based on the chain
  async function sendEmail(emailObject) { // Sending Email
    
    setManageState(true);
    const isSavedOn = accountSettings.find(item => item.id === 1)?.value;
    const domain = await contractMethods.methods.constDomain().call();
    const receiptDomain = emailObject.recipient.split("@")[1];
    const isSameHost = (receiptDomain === domain);    

    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const functionParams = [userName, emailObject.recipient];
    await transactionAction(contractMethods , "saveSenderAddress", functionParams , account); 

    const hostContractMethods = new web3.eth.Contract(contractData.hostContract, hostAddress);

    setMessageString("Sending...");
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const loggedChainId = await web3.eth.net.getId();

    const retrivedAddress = await hostContractMethods.methods.getChainDetails(receiptDomain).call();
    const senderChainAddress = await hostContractMethods.methods.getChainDetails(domain).call();

    let contactAddressFromName = null, jsonValue = null, receiptentChainId = null;

    if (retrivedAddress["0"] && retrivedAddress["1"]) {
      contactAddressFromName = retrivedAddress["0"];
      jsonValue = JSON.parse(retrivedAddress["1"]);
      receiptentChainId = jsonValue.chainId;
    }

    const isSameBlockChain = (receiptentChainId === parseInt(loggedChainId));

    let defaultEncryptedMessage = "Not Sent Item";
    if (isSavedOn) defaultEncryptedMessage = await saveSenderEncryptedEmail(emailObject, accounts);

    const publicKey = await getPublicKey(emailObject, isSameHost, contactAddressFromName, jsonValue);

    // Encrypt The data here
    if (publicKey && publicKey != "null") {
      setManageState(true);
      const key = publicKey;
      const msg = JSON.stringify(emailObject);
      const data = await getEncryptedValue(msg, key);

      const encryptedMessage = data.returnValue;
      props.handleCancel();

      if (encryptedMessage && isSameBlockChain) {
        await sendEmailOnSameChain(emailObject, encryptedMessage, accounts, isSameHost, contactAddressFromName, userName, setEncryptionLoader, contract, account , isSavedOn, defaultEncryptedMessage);
      } else if (encryptedMessage) {
        await sendEmailOnDifferentChain(emailObject, encryptedMessage, accounts, senderChainAddress, jsonValue, userName, account);
      }

      setEncryptionMsg("Message Sent");
      setTimeout(() => {
        setManageState(false);
        setEncryptionLoader(false);
        props.reRenderIt();
        props.handleCancel();
        setMessageString("Send");
        setEncryptionMsg("");
        localStorage.setItem("sendingEmail", "");
      }, 1000);

    } else {
      // Web2 emails
      const emailObjectRequest = {
        from : userName , 
        to : emailObject.recipient ,
        message: emailObject.message ,
        subject : emailObject.subject        
      }
      await sendWebTwoEmail(emailObjectRequest);
      setManageState(false);
      setEncryptionLoader(false);
      props.reRenderIt();
      props.handleCancel();
      setMessageString("Send");
      setEncryptionMsg("");
      localStorage.setItem("sendingEmail", "");
      return false;
    }


    setTimeout(() => {
      const modalMask = document.querySelector('.ant-modal-mask');
      const modalParentDiv = document.querySelector('.with-sidebar-comp');

      if (modalMask) modalMask.classList.remove('SendEmailLoader');
      if (modalParentDiv) modalParentDiv.classList.remove('SendEmailLoader');

      setEncryptionMsg("Your message is encrypting...");
    }, 1000);


    clear();

  }


  const clear =(boolValue = false)=> {

    setManageState(false);
    setEncryptionLoader(false);

    if(!boolValue){
      props.reRenderIt();
      props.handleCancel();
    }
    setMessageString("Send");
    setEncryptionMsg("");
    localStorage.setItem("sendingEmail", "");
    setShowBCC(false);
    setShowCC(false);
    setTomail("")
    const inputElement = document.getElementById('receiver');
    const inputCCElement = document.getElementById('receiver-cc');
    const inputBCCElement = document.getElementById('receiver-bcc');
    const subjectElement = document.getElementById('subject');

    if (inputElement) {
      inputElement.value = ''; // Clearing the input value
      subjectElement.value = ''; // Clearing the input value
      if(inputCCElement) inputCCElement.value = ''; // Clearing the input value
      if(inputBCCElement) inputBCCElement.value = ''; // Clearing the input value
    }

  }
  const renderDropdown =(toEmail)=> {   // todo

    if(!senderAddress.length) return false; 
    
    const result = senderAddress.filter(item => item.includes(toEmail)).map((item, index, arr) => ({
      value: item,
      label: arr[(index + 1) % arr.length]
    }));

    const handleOptionClick = (value) => {
      setSelectedOption(value);
    };
  
    return (
      <div className='dropdown'>
        {result.length > 0 && (
          <ul className='dropdown-menu'>
            {result.map((option, index) => (
              <li key={index} onClick={() => handleOptionClick(option.value)}>{option.label}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className='email-to-from-element'>
      <div className='email-to-from-common'>
        <div className='to-element'>
          <div className='box-elememt'> To </div>
          <input id="receiver" placeholder='' onChange={(e)=> {
            setTomail(e.target.value);
            setIsOpen(true)
          }} value={isOpen ? toEmail : (props.toEmail || "")} />
          <div className='cc' onClick={()=> setShowCC(!showCC)}> {showCC ? "" : "Cc"} </div>
          <div className='bcc' onClick={()=> setShowBCC(!showBCC)} > {showBCC ? "" : "Bcc"} </div>
        </div>

        {showCC && 
          <div className='to-element cc-element'>
            <div className='box-elememt'> CC </div>  <input id="receiver-cc" placeholder='' /> <div className='cc'> </div>   <div className='bcc' onClick={()=>{
                  const inputElement = document.getElementById('receiver-cc');
                  if (inputElement) {
                    inputElement.value = ''; // Clearing the input value
                  }
                  setShowCC(!showCC);
            }}> X </div>
          </div>        
        }

        {showBCC && 
          <div className='to-element cc-element'>
            <div className='box-elememt'> Bcc </div>
            <input id="receiver-bcc" placeholder='' />
            <div className='cc'> </div>
            <div className='bcc' onClick={()=> {
              const inputElement = document.getElementById('receiver-bcc');
              if (inputElement) {
                inputElement.value = ''; // Clearing the input value
              }
              setShowBCC(!showBCC);
            } } > X </div>
          </div>        
        }

        <input id="subject" className="input-class-common" placeholder='Add a Subject' />
      </div>

      <Editor placeholder="Write something..." />
      <div className="common-footer-ele btn-footer-email-compose">
        <button className="send-btn-mail" onClick={async (e) => {
          const recipient = document.getElementById("receiver").value;
          const subject = document.getElementById("subject").value;
          const cc = document.getElementById("receiver-cc") && document.getElementById("receiver-cc").value || "";
          const bcc = document.getElementById("receiver-bcc") && document.getElementById("receiver-bcc").value || "";

          setMessageString("Sending...");
          const isSavedOn = accountSettings.find(item => item.id === 1)?.value;
          let defaultEncryptedMessage = "MSG";

          if(isSavedOn){
            const emailObject = { recipient: recipient, subject: subject, message: localStorage.getItem("sendingEmail") };
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            defaultEncryptedMessage = await saveSenderEncryptedEmail(emailObject, accounts);
          }

          await sendEmails(recipient.replace(/\s/g, '').split(",") , cc.replace(/\s/g, '').split(",") , bcc.replace(/\s/g, '').split(",") , subject, localStorage.getItem("sendingEmail") , props , isSavedOn , defaultEncryptedMessage);


          setEncryptionLoader(true);
          setEncryptionMsg("Message Sent");

          setTimeout(() => {
            clear();
          }, 1000);

        }} >
          {htmlRender ? "" : <ComposeIcon />}  {htmlRender ? Message : Message}
        </button>
      </div>

      <SendEmailLoader isOpen={encryptionLoader} msg={encryptionMsg} />
    </div>
  );
};

export default SendEmail;
