import React, { useState, useEffect } from 'react';
import "./profile.css"
import styled from "styled-components";
import Web3 from 'web3';
import contractData from '../../contracts/contract.json';
import config from '../../config/config.json';
import Cookies from "universal-cookie";
import db from '../../db/dbService.js';
import FbLoader from '../../components/loader/FbLoader.js';
import { validateTheWebReturedValues } from '../../helper/object-validation-helper.js';
import { userAuthLogin } from '../../helper/auth-helper.js';
import { web3AccountCheck } from '../../helper/web3-helper.js';
import { SendEmailLoader } from '../modal-popup/CommonAlert.js';
const contractAddress = config.json.CONTRACT;

const UserProfile = () => {

  const cookies = new Cookies();

  const [user , setUser] = useState(cookies.get("userObject"));
  const [web3Value, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userObject, setUserObject] = useState(null);
  const [availableAccount, setAvailableAccount] = useState([]);
  const [encryptionLoader, setEncryptionLoader] = useState(false);
  const [encryptionMsg, setEncryptionMsg] = useState('Switching Account...');


  const web3 = new Web3(window.ethereum);
  const contractMethods = new web3.eth.Contract(contractData.storageContract, contractAddress);
  const userName = user && user.name;

  const handleOptionChange = async (userData) => {
    await setEncryptionMsg("Switching Account..");
    await setEncryptionLoader(true);
    await userAuthLogin(userData.domain , contractMethods , "profile");
    await new Promise(resolve => { setTimeout(resolve, 2000); });
    setEncryptionMsg("Account Switched");
    setTimeout(async () => {      
          await setUser(cookies.get("userObject"))
          await setUserObject(null);
          await setAvailableAccount([]);
          await fetchcontractdata(userData.domain);
          setEncryptionLoader(false);          
    }, 2000);
  };
  

  useEffect(() => {
    web3AccountCheck(setWeb3 , setAccount);
  }, []);



  useEffect(() => {
    async function fetchdata() {
      const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);
      setContract(contractInstance);

    }
    if (web3Value) {
      fetchdata();
    }
  }, [web3Value]);


  async function fetchcontractdata(userName = null ) {
    const userNameValues = userName || (user && user.name);
    // Initialize contract instance
    const userDetails = await contract.methods.getUserByUsername(userNameValues).call({ from: account });    
    const getUserDetailsForWallet = await contract.methods.getUserDetailsForWallet().call({ from: account });
    const formattedAccount = await formatAccount(getUserDetailsForWallet , userNameValues);
    setAvailableAccount(formattedAccount);      
    const filteredData = validateTheWebReturedValues(userDetails);
    setUserObject(filteredData);
  }


  useEffect(() => {
    if (contract) {
      fetchcontractdata();
    }
  }, [account]);


  async function formatAccount(users , userNameValue){

    const formattedAccount = users.map((mappingValue)=> {
      mappingValue.isCheck = false;
      if(mappingValue.domain == userNameValue) mappingValue.isCheck = true; 
      return validateTheWebReturedValues(mappingValue); 
    });

    const sortedArray = formattedAccount.sort((a, b) => {
      // Check if domain of a matches the string
      if (a.domain === userNameValue) {
        return -1; // Move a to the beginning
      }
      // Check if domain of b matches the string
      else if (b.domain === userNameValue) {
        return 1; // Move b to the beginning
      }
      // Keep the original order
      else {
        return 0;
      }
    });

    return sortedArray;
  }


  return (
    <>
    <div className="profile-container">
      {userObject && 
        <>
          <div className="profile-header">
            {/* <img className="profile-picture" src={profilePicture} alt="Profile" /> */}
            <h2>{userObject.name}</h2>
          </div>
          <div className="profile-details">
            <h3>Contact Information</h3>
            <ul>
              <li><strong>Wallet Address:</strong> {userObject.walletAddress}</li>
              <li><strong>Public Key:</strong> {userObject.publicKey}</li>
              <li><strong>Creation Date:</strong> {userObject.creationDate}</li>
              <li><strong>User ID:</strong> {parseInt(userObject.userId)}</li>
            </ul>
          </div>
          <div className="profile-social">
            <h3>Domain</h3>
            <p>{userObject.domain}</p>
          </div>     
        </>
      }


      </div>

      <div className='parent-switch-users'> 
        <div className='switch-users'>
            <div className='switch-users-add-label'>Switch Email Address</div>


            {availableAccount.map((item, index) => (
            <div key={index} className='parent-account-render'>
              <div className='account-render'>
                {item.domain}
              </div>
              <div className='radio-button-container'>
                <label className="radio-button-label">
                  <input
                    type="radio"
                    name={`option-${index}`}
                    value={item.domain}
                    checked={item.isCheck}
                    onChange={() => handleOptionChange(item , index)}
                  />
                  <span className="radio-button-custom">x</span>
                </label>
              </div>
            </div>  
            ))}

            <div>
              <button className='add-address-btn-profile'> Add new Account </button>
            </div>
        </div>
      </div>

      <SendEmailLoader isOpen={encryptionLoader} msg={encryptionMsg} />


      </>
  )
  
}

export default UserProfile
