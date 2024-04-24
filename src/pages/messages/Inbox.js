import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Search2 } from "@styled-icons/remix-line/Search2";
import SupportIcon from "../../assets/menu-icons/filter-search.png";
import { EyeSlash } from "@styled-icons/bootstrap/EyeSlash";
import { Star } from "@styled-icons/boxicons-solid/Star";
import { StarOutline } from "@styled-icons/material/StarOutline";
import CommonFooter from "../../components/common-element/CommonFooter";
import Web3 from 'web3';
import contractData from '../../contracts/contract.json';
import config from '../../config/config.json';
import { Modal } from 'antd';
import Decrypt from "./Decrypt.js";
import Profile from '../profile-section/Profile.js';
import { EyeOutline } from '@styled-icons/evaicons-outline/EyeOutline';
import Cookies from "universal-cookie";
import db from '../../db/dbService.js';
import { returnEmailRecords } from '../../db/dbHelper.js';
import FbLoader from '../../components/loader/FbLoader.js';
import { transactionAction } from '../../helper/chain-helper.js';

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
  const [web3Value, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);

  const [user] = useState(cookies.get("userObject"));

  const web3 = new Web3(window.ethereum);
  const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);
  const userName = user && user.name;

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
            setAccount(accounts[0]);
          }
        })
        .catch(err => console.error(err));

      // Listen for account changes
      window.ethereum.on('accountsChanged', accounts => {
        setAccount(accounts[0] || '');
      });
    } else {
      console.log('MetaMask is not installed');
    }
  }, []);



  useEffect(() => {
    // Initialize contract instance
    async function fetchdata() {
      const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);
      setContract(contractInstance);
    }
    if (web3Value) {
      fetchdata();
    }
  }, [web3Value]);


  useEffect(() => {
    const renderInbox = () => {
      setTimeout(() => {
        setRecordsEmailsValue();
      }, 5000);
    };
    setRecordsEmailsValue();

    window.addEventListener('renderInbox', renderInbox);
    return () => {
      window.removeEventListener('renderInbox', renderInbox);
    };
  }, []);



  // function to check & uncheck the emails
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


  // function to get & format the emails 
  async function setRecordsEmailsValue() {

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const emailList = await contractMethods.methods.getEmailList(userName).call({ from: accounts[0] });
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

      const encryptedEmailList = new Map(emails.map(item => [item.mailId, item.decryptedMail]));

      const decryptedEmailList = formattedResult.map(item => {
        if (encryptedEmailList.has(item.id)) {
          return { ...item, decryptedMail: encryptedEmailList.get(item.id) };
        }
        return item;
      });

      await setEmailObject(decryptedEmailList);
      await setLoader(false);
    } catch (error) {
      console.log(error);
    }
  }


// function to append the decypted email on the existing list
  async function getDecrypValue(encryptedMsg, index) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      try {
        const decryptedMsg = await window.ethereum.request({ method: 'eth_decrypt', params: [encryptedMsg, accounts[0]] });
        const mailObject = emailObject[index];

        const mailId = mailObject.id;
        const decryptedMail = decryptedMsg;

        const decryptedObject = { mailId, decryptedMail };
        await indexedDb(decryptedObject);

        const returnJson = JSON.parse(decryptedMsg);
        return returnJson.message;

      } catch (error) {
        console.log(error);
        return null;
      }
    }
    return null;
  }

// function to save the decrypted email on the indexedDb 
  const indexedDb = async (object) => {
    const value = await db.emails.where("mailId").equals(object.mailId).toArray();
    if (value.length) {
      // update;
      await db.emails.update(value[0].id, object);
    } else {
      // create;
      await db.table('emails').add(object);
    }
  }

// function to display the decrypted email
  const handleDecryptedClick = async (msg) => {
    try {
      const jsonMessage = JSON.parse(msg.decryptedMail);
      await setEncrypt(jsonMessage.message);
      setIsModalOpen(true);
    } catch (error) {
      console.log("SOMETHING WENT WRONG")
    }
  };

  // function to display the decrypted email by decrypting from metamask
  const handleEncryptedClick = async (msg, index) => {

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const message = await getDecrypValue(msg.encryptedData, index);
    if (message) {
      if (accounts.length) {
        if (!msg.isRead) {
          try {
            const functionParams = [userName, msg.id];
            await transactionAction(contract, "markEmailAsRead", functionParams, account);
          } catch (error) {
            console.log(error);
          }

        }
      }
      await setEncrypt(message);
      setIsModalOpen(true);
    }
  };

  // function for email action TODO
  async function actionTypeValue(actionType) {
    switch (actionType) {
      case "Delete":
        // delete code comes here
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
            <div key={msg.id} className={!msg.isRead ? "msg-row-inbox starred-msg" : "msg-row-inbox"}>
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
