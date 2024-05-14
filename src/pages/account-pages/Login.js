import React, { useState, useEffect } from "react";
import './signup.css';
import { Link } from "react-router-dom";
import { login } from "../../service/api-actions";
import Web3 from 'web3';
import contract  from '../../contracts/contract.json';
import constant  from '../../constant/constant.js';

import config  from '../../config/config.json';
import { setCacheStorage , getCacheStorage } from "../../helper/cache-helper";
import Cookies from "universal-cookie";

const contractAddress = config.json.CONTRACT;
const web3 = new Web3(window.ethereum);
const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
const cookies = new Cookies();

const Login = () => {
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [domainValue , setDomainValue ] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [errorType, setErrorType] = useState('');
    const [userNameWithDomain, setUserName] = useState('');

    useEffect(() => {
        // save the domain on browser from the host smart contract
        async function setDomain() {
            const domain = await contractMethods.methods.constDomain().call();
            setDomainValue(domain);
            const createdUser = await getCacheStorage("createdUser");
            if(createdUser && createdUser.userNameWithDomain) {
                setUserName(createdUser.userNameWithDomain);
                handleBlur();
            } 
        }
        setDomain();
      }, []);
    
    const handleFocus = () => { setFocused(true) };  
    const handleBlur = () => { setFocused(false) };

    // form submission
    async function handleSubmit(e){
        await setToastMsg("");
        await setErrorType("");
        e.preventDefault();
        await loginValidation();
    }
    
    // Initiating the login method.    
    async function loginValidation() {
        const userName = userNameWithDomain;
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
            const connectedAccount = accounts[0];
                const message = constant.web3Constant.loginMessage;
            try {
                await window.ethereum.request({ method: 'personal_sign', params: [message, connectedAccount] });
            } catch (error) {
                console.log("error", error);
                return true;
            }
            console.log("userName", userName);
            await userLogin(userName);
        }
    }


    // function to check the user and authenticate to our dmail
    async function userLogin(username) {
        setIsButtonLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const isUserPresent = await contractMethods.methods.loginUser(userNameWithDomain, accounts[0]).call();
        if(isUserPresent){
            const data = await login(username);   
            if(data.isAuth){
                const userObject = { name : username ,  wallet : accounts[0], token : data.token  };
                cookies.set("accessToken", data.token, { path: "/" });
                cookies.set("userObject", userObject, { path: "/" });
                setCacheStorage("loggedUser" , userObject);
                window.open(`/emails`, "_self");
                return true;
            }
        }
        await setToastMsg("User Not Found");
        await setErrorType("user");
        setIsButtonLoading(false);
        return true;
    }
    const userName = document.getElementById("email") && document.getElementById("email").value;

    return (
        <div className="wrapper">
            <div className="title login-value">
                Log In
            </div>
            <form onSubmit={handleSubmit} style={{ opacity: isButtonLoading ? "50%" : "100%" }}>
                <div className={`field ${errorType}`}>
                    <input id="email" type="text" value={userNameWithDomain} required onChange={(e)=> {setUserName(e.target.value)}} onFocus={handleFocus} onBlur={handleBlur} />
                    <label>{focused || userNameWithDomain ? 'Email' : `username@${domainValue}`}</label>
                </div>
                
                {toastMsg && 
                    <div className="error-message">
                            <span className="error-value"> {toastMsg} </span>
                    </div>
                }

                <div className="field submit-btn-form">
                    <button type="submit"> {isButtonLoading ? "Please Wait" : "Log In" }</button>
                </div>
             <hr className='seperation-tag-attribute' />
                <div className="signup-link">
                    Don't have an account?  <Link to="/register"> Sign Up</Link>
                </div>
            </form>


        </div>
    )
};

export default Login;
