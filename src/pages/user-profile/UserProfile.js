import React, { useState, useEffect } from 'react';
import "./profile.css"
import styled from "styled-components";
import Web3 from 'web3';
import contractData from '../../contracts/contract.json';
import config from '../../config/config.json';
import Cookies from "universal-cookie";
import db from '../../db/dbService.js';
import FbLoader from '../../components/loader/FbLoader.js';
const contractAddress = config.json.CONTRACT;

const UserProfile = () => {

  const cookies = new Cookies();

  const [user] = useState(cookies.get("userObject"));
  const [web3Value, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userObject, setUserObject] = useState(null);


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
    async function fetchdata() {
      const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);
      setContract(contractInstance);

    }
    if (web3Value) {
      fetchdata();
    }
  }, [web3Value]);


  useEffect(() => {
    async function fetchcontractdata() {

      // Initialize contract instance
      const userDetails = await contract.methods.getUserByUsername(userName).call({ from: account });

      const filteredData = {};
      for (const key in userDetails) {
        if (!isNaN(key)) continue; // Skip if the key is a number
        filteredData[key] = userDetails[key];
      }

      setUserObject(filteredData)
    }
    if (contract) {
      fetchcontractdata();
    }
  }, [account]);


  return (
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
  )
  
}

export default UserProfile
