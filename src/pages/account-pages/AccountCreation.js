import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './signup.css';
import styled from "styled-components";
import { AccountBalanceWallet } from "@styled-icons/material-outlined/AccountBalanceWallet";
import Web3 from 'web3';
import contractData  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { ConnectWallet} from "../modal-popup/CommonAlert";
import { web3Constant } from "../../constant/constant";
import {getPublicKeyValue} from "../../helper/email-helper.js"
import { transactionAction } from "../../helper/chainHelper.js";

const iconStyles = `
color: #0D67FE;
width: 30px;
height: 30px;
`;

const Wallet = styled(AccountBalanceWallet)`${iconStyles}`;
const web3 = new Web3(window.ethereum);

const SignUp = () => {

    const navigate = useNavigate();
    const [btnName, setBtnName] = useState("Connect Wallet");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [errorType, setErrorType] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [connectWalletModal, setConnectWalletModal] = useState(false);
    const [sign, setSign] = useState('');
    const [signBtnName, setSignBtnName] = useState("Sign Up");

    const [web3Value, setWeb3] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);

    const contractMethods = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);

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
      }, []);


    useEffect(() => {
        async function fetchdata(){
          // Initialize contract instance
          const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);
          const domain = await contractInstance.methods.constDomain().call();
          localStorage.setItem("domain", domain);
          setContract(contractInstance);
        }
        if (web3Value) {
            fetchdata();
        }
      }, [web3Value]);



    async function connectMetaMask() {
        await setToastMsg("");
        await setErrorType("")
        setConnectWalletModal(true);
    }

    async function handleSubmit(e){
        e.preventDefault();
        setToastMsg("")
        await setErrorType("")
        await getConnectedWalletAndSign();
    }

    async function getConnectedWalletAndSign() {
        try {
            const username = document.getElementById('username').value;
            const name = document.getElementById('name').value;

            if(!sign){
                await setErrorType("wallet");
                await setToastMsg("Please connect your wallet");
                return null;
            }

            // Requesting connected accounts
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const connectedAccount = accounts[0];
                const publicKey = await getPublicKeyValue();
                if(!publicKey) return null;
                
                setIsButtonLoading(true);
                setSignBtnName("Creating Account...");
                const message = web3Constant.signMessage;
                const verifyAddress = web3.eth.accounts.recover(message, sign);
                const isVerified = verifyAddress.toLowerCase() === connectedAccount.toLowerCase();

                const userDomain = localStorage.getItem("domain");
                const userNameWithDomain  = `${username}@${userDomain}`;
                const value = await contractMethods.methods.getUserByUsername(userNameWithDomain).call();
                const userId = parseInt(value.userId);

                if(!userId && isVerified){

                    const createdDate = new Date();
                    const formattedDate = createdDate.toLocaleDateString('en-GB');
                    let recordCreated = false;
                    const functionParams = [username, name, publicKey, connectedAccount, formattedDate];
                    const txHash = await transactionAction(contract , "createAccount", functionParams , account);

                    if(txHash){
                        recordCreated = true;
                    }
                    setIsButtonLoading(false);

                    if(recordCreated){        
                        setSignBtnName("Account Created");
                       
                        setTimeout(function() {
                            navigate(`/`);
                        }, 1000);
                        return true;
                    }
                }

                if(userId){
                    await setToastMsg("User already exists");
                }else{
                    await setToastMsg("Unauthorized! Please Try Again");
                }
                await setErrorType("user");

            } else {
                await setToastMsg("Please Connect Your metamask wallet");
                await setErrorType("wallet");
            }

        } catch (error) {
            await setToastMsg("Please Connect Your metamask wallet");
            await setErrorType("wallet");
        }
        setIsButtonLoading(false);
    }

    const saveSignature =(signature)=> {

        if(signature){
            setSign(signature);
            setConnectWalletModal(false);
            setBtnName("Connected");
        }
    }

    return (
        <div className="wrapper">
            <div className="title">
                Sign Up
            </div>
            <form onSubmit={handleSubmit} style={{ opacity: isButtonLoading ? "50%" : "100%" }}>
                <div className={`field ${errorType}`}>
                    <input type="text" id="username" required />
                    <label>Username</label>
                </div>
                <div className={`field ${errorType}`}>
                    <input type="text" id="name" required />
                    <label>Name</label>
                </div>

                {toastMsg && 
                    <div className="error-message">
                            <span className="error-value"> {toastMsg} </span>
                    </div>
                }

                <div className="field submit-btn-form">
                    <button type="submit"> {signBtnName} </button>
                </div>
             <hr className='seperation-tag-attribute' />

                <div className={`connect-wallet-btn ${errorType}`} onClick={() => { connectMetaMask(); } }> 
                        <Wallet />  {btnName}
                </div> 

                <div className="signup-link sign-in-link-ele">
                    Already have an account?  <Link to="/"> Login</Link>
                </div>
            </form>

               <ConnectWallet isModalOpen = {connectWalletModal} close = {() => { setConnectWalletModal(false)}} sendSign={saveSignature} />
        </div>  
    )
};

export default SignUp;
