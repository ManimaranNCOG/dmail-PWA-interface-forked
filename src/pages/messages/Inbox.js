import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Search2 } from "@styled-icons/remix-line/Search2";
import SupportIcon from "../../asserts/menu-icons/filter-search.png";
import { EyeSlash } from "@styled-icons/bootstrap/EyeSlash";
import { Star } from "@styled-icons/boxicons-solid/Star";
import { StarOutline } from "@styled-icons/material/StarOutline";
import CommonFooter from "../../components/common-element/CommonFooter";
import Web3 from 'web3';
import contract from '../../contracts/contract.json';
import config from '../../config/config.json';
import { Modal } from 'antd';
import Decrypt from "./Decrypt.js";
import Profile from '../profile-section/Profile.js';
import { EyeOutline } from '@styled-icons/evaicons-outline/EyeOutline';
import Cookies from "universal-cookie";
import { logout } from '../../auth/logout.js';
import db from '../../db/dbService.js';
import { returnEmailRecords } from '../../db/dbHelper.js';
import FbLoader from '../../components/loader/FbLoader.js';


const cookies = new Cookies();

const contractAddress = config.json.CONTRACT;
const iconStyles = `color: #4a88c5; width: 20px; height: 20px;`;
const iconColorStyles = `color: #ffbe00; width: 20px; height: 20px;`;

const ComposeIcon = styled(Search2)`
  ${iconStyles}
`;
const EyeSlashIcon = styled(EyeSlash)`
  ${iconStyles}
`;

const StarIcon = styled(Star)`
  ${iconColorStyles}
`;

const StarOutlineIcon = styled(StarOutline)`
  ${iconStyles}
`;

const EyeOutlineIcon = styled(EyeOutline)`
  ${iconStyles}
`;

const Inbox = () => {
  const [emailObject, setEmailObject] = useState([]);
  const [encrypt, setEncrypt] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loader, setLoader] = useState(true);
  const [userId, setUserId] = useState(true);


  
  const [user] = useState(cookies.get("userObject"));

  const networkId = config.json.NETWORK_ID;
  const web3 = new Web3(networkId);
  const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
  const userName = user && user.name;
  const token = user && user.token;


  useEffect(() => {
    setRecordsEmailsValue();
  }, []);



  useEffect(() => {
    const renderInbox = () => {
      setTimeout(() => {
        setRecordsEmailsValue();
      }, 5000);
    };

    
    window.addEventListener('renderInbox', renderInbox);
    return () => {
      window.removeEventListener('renderInbox', renderInbox);
    };
  }, []);



  const handleCheckboxChange = (event, msg) => {

    const { checked } = event.target;

    const emailId = msg.id;
    let selectedMailIds = selectedItems;

    if (checked) {
      selectedMailIds.push(emailId);
    } else {
      selectedMailIds = selectedMailIds.filter(item => item !== emailId);
    }

    setSelectedItems(selectedMailIds);
    return true;
  };


  const handleOk = () => {
    setIsModalOpen(false);
    setRecordsEmailsValue();
  };


  async function setRecordsEmailsValue() {

    try {
      
      const emailList = await contractMethods.methods.getEmailList(userName).call();
      const emails = await returnEmailRecords(userName);
  
      const formattedResult = emailList
        .filter(email => email.senderName)
        .map(email => ({
          id: parseInt(email.id),
          subject: email.subject,
          encryptedData: email.encryptedData,
          created_at: email.receivedDate,
          isStarred: true,
          sender: email.senderName,
          isRead: email.isRead
        }));
  
        const array1Map = new Map(emails.map(item => [item.mailId, item.decryptedMail]));
        const updatedArray2 = formattedResult.map(item => {
              if (array1Map.has(item.id)) {
                  return { ...item, decryptedMail: array1Map.get(item.id) };
              }
              return item;
          });
  
        await setEmailObject(updatedArray2);
        await setLoader(false);
    } catch (error) {
      console.log(error);
    }
  }





  async function getDecrypValue(encryptedMsg, index) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      try {
        const decMsg = await window.ethereum.request({
          method: 'eth_decrypt',
          params: [encryptedMsg, accounts[0]]
        });

        const emailListObj = emailObject;
        const mailObject = emailListObj[index];

        const mailId = mailObject.id;
        const decryptedMail = decMsg;

        const decryptedObject = {mailId , decryptedMail };
        await indexedDb(decryptedObject);

        // emailListObj[index].decryptedEmail = JSON.parse(decMsg);
        const returnJson = JSON.parse(decMsg);
        return returnJson.message;

      } catch (error) {
        console.log(error);
        return null;
      }
    }
    return null;
  }


  const indexedDb = async (object) => {
      const value = await db.emails.where("mailId").equals(object.mailId).toArray();
      
      if(value.length){
        // update;
        await db.emails.update(value[0].id, object);
      }else{
        // create;
        await db.table('emails').add(object);
      }
  }


  const handleDecryptedClick = async (msg) => {

    try {

      const jsonMessage = JSON.parse(msg.decryptedMail);      
      await setEncrypt(jsonMessage.message);
      setIsModalOpen(true);
    } catch (error) {
      console.log("SOMETHING WENT WRONG")
    }
  };

  const handleEncryptedClick = async (msg, index) => {

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const message = await getDecrypValue(msg.encryptedData, index);
    if (message) {
      if (accounts.length) {
        if (!msg.isRead) {

          try {
            web3.eth.accounts.wallet.add(config.json.KEY);
            contractMethods.methods.markEmailAsRead(userName, msg.id, token).send({ from: config.json.DEFAULT_SENDER, gas: '1000000', gasPrice: 1000000000 });
          } catch (error) {
              console.log(error)
          }
        }
      }
      await setEncrypt(message);
      setIsModalOpen(true);
    }
  };

  async function actionTypeValue(actionType) {

    switch (actionType) {

      case "Delete":
          try {
              web3.eth.accounts.wallet.add(config.json.KEY);
              const estimatedGas = await contractMethods.methods.deleteEmailsBulk(userName, selectedItems, token).estimateGas({ from: config.json.DEFAULT_SENDER });
              const gasPrice = await web3.eth.getGasPrice();
              await contractMethods.methods.deleteEmailsBulk(userName, selectedItems, token).send({ from: config.json.DEFAULT_SENDER, gas: estimatedGas, gasPrice: gasPrice });
          } catch (error) {
              logout();
          }
        break;

      default:
        break;
    }
  }

  const buttonActions = ["Delete", "Archive", "Report", "Sweep", "Move to", "Reply", "Mark all as read"];

  return (
    
    <>
      <div className="header-inbox-common">
        <div className="search">
          <input type="text" className="searchTerm" placeholder="Search" />
          <button type="submit" className="searchButton">
            <ComposeIcon />
          </button>

          <button className="search-filter-btn">
            <img className="profile-drop-img" src={SupportIcon} />
          </button>
        </div>

        <div className="account-section">
          <span> <Profile /> </span>
        </div>
      </div>

      <div className="container-inbox-section">
        <div className="header-inbox-div">
          <div className="btn-inbox">
            <button>Inbox</button>
          </div>
          <div className="btn-inbox-actions">
            {buttonActions.map((actionType, index) => (
              <button key={index} onClick={async () => {
                await actionTypeValue(actionType);
              }} className="action-inbox-btn-specific">
                {actionType}
              </button>
            ))}
          </div>
          <div className="btn-inbox-filter">
            <button>filter</button>
          </div>
        </div>

        <div className="inbox-msg-check messages-web">
          {emailObject.map((msg, index) => (
            <div  key={msg.id}  className={!msg.isRead ? "msg-row-inbox starred-msg" : "msg-row-inbox"}>
              <div className="check-box">
                <div className="checkboxOverride">
                  <input
                    type="checkbox"
                    id={`checkboxInputOverride${index}`}
                    name={`checkboxInputOverride${index}`}
                    value="1"
                    onChange={(event) => handleCheckboxChange(event, msg)}
                  />
                  <label htmlFor="checkboxInputOverride"></label>
                </div>
              </div>
              <div className="star"> {msg.isStarred ? <StarIcon /> : <StarOutlineIcon />} </div>
              <div className="sender"> {msg.sender} </div>
              <div className="email-subject"> {msg.subject}</div>
              <div className="date-section"> {msg.created_at} </div>

              {msg.decryptedMail ? (
                <div className="decrypt" onClick={() => { handleDecryptedClick(msg) }}>
                  <EyeOutlineIcon />
                </div>
              ) : (
                <div className="decrypt" onClick={() => { handleEncryptedClick(msg, index) }} >
                  <EyeSlashIcon />
                </div>
              )}
            </div>
          ))}


          {loader && Array(4).fill().map((_, index) => (
            <FbLoader key={index} />
          ))}
        </div>

      </div>

      < CommonFooter />

      <Modal className="modal-send-email-header" open={isModalOpen} onOk={handleOk} onCancel={handleOk} footer={null} >
        <div className='send-email-body-content'>
          <Decrypt data={encrypt} />
        </div>
      </Modal>
    </>
  );
};

export default Inbox;
