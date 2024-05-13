import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Search2 } from "@styled-icons/remix-line/Search2";
import SupportIcon from "../../assets/menu-icons/filter-search.png";
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

const buttonActions = ["Delete", "Archive", "Report", "Sweep", "Move to", "Reply", "Mark all as read"];
const SentItems = () => {
  const [emailObject, setEmailObject] = useState([]);
  const [encrypt, setEncrypt] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMessage, setOpenMessage] = useState(null);
  const [user] = useState(cookies.get("userObject"));

  const web3 = new Web3(window.ethereum);
  const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
  const userName = user && user.name;


  useEffect(() => {

    // function to get the sent email list from the smart contract
    async function fetchValue() {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const getSentEmailList = await contractMethods.methods.getSentEmailList(userName).call({ from: accounts[0] });
      setEmailObject(getSentEmailList);
    }

    fetchValue();
  }, []);

  // function to save the decypted emails
  const handleDecryptedClick = async (msg) => {
    await setEncrypt(msg.decryptedEmail.message);
    setIsModalOpen(true);
  };

  // function to save the decypted emails
  const handleEncryptedClick = async (msg, index) => {
    const message = await getDecrypValue(msg.encryptedData, index);
    await setOpenMessage(msg)
    await setEncrypt(message);
    setIsModalOpen(true);
  };

  const handleOk = () => { setIsModalOpen(false) };

  // function to decrypt the sent email items
  async function getDecrypValue(encryptedMsg, index) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      try {
        const decMsg = await window.ethereum.request({
          method: 'eth_decrypt',
          params: [encryptedMsg, accounts[0]]
        })


        console.log("decMsg",decMsg)

        const emailListObj = emailObject;
        emailListObj[index].decryptedEmail = JSON.parse(decMsg);
        const returnJson = JSON.parse(decMsg);
        return returnJson.message;

      } catch (error) {
        console.log(error);
        return null;
      }
    }
    return null;
  }



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
            <button>Sent Items</button>
          </div>
          <div className="btn-inbox-actions">
            {buttonActions.map((actionType, index) => (
              <button key={index} className="action-inbox-btn-specific">
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
            <div className={msg.isRead ? "msg-row-inbox starred-msg" : "msg-row-inbox"}>
              <div className="check-box">
                <div className="checkboxOverride">
                  <input
                    type="checkbox"
                    id={`checkboxInputOverride${index}`}
                    name={`checkboxInputOverride${index}`}
                    value="1"
                  />
                  <label for="checkboxInputOverride"></label>
                </div>
              </div>
              <div className="star"> {!msg.isStarred ? <StarIcon /> : <StarOutlineIcon />} </div>
              <div className="sender"> {msg.sender} </div>
              <div className="email-subject"> {msg.subject}</div>
              <div className="date-section"> {msg.created_at} </div>

              {msg.decryptedEmail ? (
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

        </div>

      </div>

      < CommonFooter />

      <Modal className="modal-send-email-header" open={isModalOpen} onOk={handleOk} onCancel={handleOk} footer={null} >
        <div className='send-email-body-content'>
          <Decrypt data={encrypt} emailObject={openMessage} />
        </div>
      </Modal>
    </>
  )
}

export default SentItems
