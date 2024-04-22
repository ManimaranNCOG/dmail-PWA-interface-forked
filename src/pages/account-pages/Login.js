import React, { useState, useEffect } from "react";
import './signup.css';
import { Link } from "react-router-dom";
import { login } from "../../service/actions";
import Web3 from 'web3';
import contract  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import { setCacheStorage } from "../../helper/cacheHelper";
import Cookies from "universal-cookie";

const contractAddress = config.json.CONTRACT;
const web3 = new Web3(window.ethereum);
const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
const cookies = new Cookies();

const Login = () => {
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [domainValue , setDomainValue ] = useState( localStorage.getItem("domain") || "domain.com");
    const [toastMsg, setToastMsg] = useState('');
    const [errorType, setErrorType] = useState('');


    useEffect(() => {
        async function setDomain() {
            const domain = await contractMethods.methods.constDomain().call();
            setDomainValue(domain);
        }
        setDomain();
      }, []);

    
    const handleFocus = () => {
      setFocused(true);
    };
  
    const handleBlur = () => {
      setFocused(false);
    };


    async function handleSubmit(e){

        await setToastMsg("");
        await setErrorType("");
        e.preventDefault();
        await loginValidation();
    }

    
    async function loginValidation() {
        const userName = document.getElementById("email").value;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            const connectedAccount = accounts[0];
                const message = `I accept the ncog Terms of Service: \n\nURI:\nhttps://app.ncog.com\n\nVersion:\n1\n\nChain ID:\n1\n\n\n\n`;
            try {
                await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, connectedAccount]
                });
            } catch (error) {
                console.log("error", error);
                return true;
            }
            await userLogin(userName);
        }
    }


    async function userLogin(username) {

        setIsButtonLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const isUserPresent = await contractMethods.methods.loginUser(userName, accounts[0]).call();

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
                    <input id="email" type="text" required onFocus={handleFocus} onBlur={handleBlur} />
                    <label>{focused || userName ? 'Email' : `username@${domainValue}`}</label>
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
