import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './signup.css';
import styled from "styled-components";
import { AccountBalanceWallet } from "@styled-icons/material-outlined/AccountBalanceWallet";
import { createAccount } from "../../service/actions";
import Web3 from 'web3';
import contract  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { ConnectWallet} from "../modal-popup/CommonAlert";
import { web3Constant } from "../../constant/constant";

const iconStyles = `
color: #0D67FE;
width: 30px;
height: 30px;
`;

const Wallet = styled(AccountBalanceWallet)`${iconStyles}`;
const networkId = config.json.NETWORK_ID;
const web3 = new Web3(networkId);

const SignUp = () => {
    const navigate = useNavigate();
    const [btnName, setBtnName] = useState("Connect Wallet");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [errorType, setErrorType] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [connectWalletModal, setConnectWalletModal] = useState(false);
    const [sign, setSign] = useState('');
    const [signBtnName, setSignBtnName] = useState("Sign Up");

    const contractMethods = new web3.eth.Contract(contract.storageContract, config.json.CONTRACT);

    useEffect(() => {
        async function fetchData() {
            const domain = await contractMethods.methods.constDomain().call();
            localStorage.setItem("domain", domain);
        }
        fetchData();
    }, []);


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


    async function getPublicKey() {

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
            if (accounts.length) {
                const encryptionPublicKey = await window.ethereum.request({
                    method: 'eth_getEncryptionPublicKey',
                    params: [accounts[0]]
                })
                return encryptionPublicKey;
            }
            return null;            
        } catch (error) {
            return null;
        }
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
                const publicKey = await getPublicKey();
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
                    const requestObject = {  username,  name,  connectedAccount, publicKey , userDomain  };

                    const createdDate = new Date();
                    const formattedDate = createdDate.toLocaleDateString('en-GB');

                    let recordCreated = false;

                    try {
                        web3.eth.accounts.wallet.add(config.json.KEY);
                        const estimatedGas = await contractMethods.methods.createAccount(username, name, publicKey, connectedAccount, formattedDate).estimateGas({ from: config.json.DEFAULT_SENDER });
                
                        // Get current gas price
                        const gasPrice = await web3.eth.getGasPrice();
                        await contractMethods.methods.createAccount(username, name, publicKey, connectedAccount, formattedDate).send({ from: config.json.DEFAULT_SENDER, gas: parseInt(estimatedGas), gasPrice: parseInt(gasPrice) });
                        recordCreated = true;
                    } catch (error) {
                        recordCreated = false;
                    }

                    if(!recordCreated){
                        const data = await createAccount(requestObject);
                        if (data.message === "Account Created Successfully") {
                                recordCreated = true;
                            }
                    }
                    setIsButtonLoading(false);
                    if(recordCreated){        
                        setSignBtnName("Account Created")
                       
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
