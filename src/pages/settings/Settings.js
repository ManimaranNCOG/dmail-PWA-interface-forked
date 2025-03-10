import React, { useState , useEffect} from 'react';
import './settings.css'; // Import CSS file for styling
import Web3 from 'web3';
import contractData  from '../../contracts/contract.json';
import config  from '../../config/config.json';
import styled from "styled-components";
import { Tick } from "@styled-icons/typicons/Tick";
import Cookies from "universal-cookie";
import useDarkMode from 'use-dark-mode';
import { transactionAction } from '../../helper/chain-helper.js';

const cookies = new Cookies();

const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;

const ComposeIcon = styled(Tick)`
  ${iconStyles}
`;  

const accountSettings = [
    { label: "Save all sent emails", value: false  , id : 1},
    { label: "Include Reply Message", value: false  , id : 2},
    { label: "Dark Mode", value: false , id : 3 },
    { label: "Notifications", value: false , id : 4 }
];

const Settings = () => {

    const [settings, setSettings] = useState(accountSettings);
    const [buttonText, setButtonText] = useState('Save Settings');
    const [buttonClass, setButtonClass] = useState('');
    const [user] = useState(cookies.get("userObject"));
    const [web3Value, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);

    const darkMode = useDarkMode(false);
    const web3 = new Web3(window.ethereum);
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
        async function fetchdata(){
          // Initialize contract instance
          const contractInstance = new web3.eth.Contract(contractData.storageContract, config.json.CONTRACT);      
          setContract(contractInstance);
          try {
                const settingsJson = await contractInstance.methods.getAccountSettings(userName).call();
                setSettings(JSON.parse(settingsJson));                    
            } catch (error) {
                return true;
            }
        }
        if (web3Value) {
            fetchdata();
        }
      }, [web3Value]);




    const handleSaveSettings = async () => {

        setButtonText("Processing...");
        setButtonClass('loading');

        if (buttonClass === "success") return;
        const functionParams = [ userName, JSON.stringify(settings) ] ;
        const txHash = await transactionAction(contract , "createAndUpdateSettings", functionParams , account);  

        if(txHash){
            setButtonClass("success");
            setButtonText("Saved");

                setTimeout(function() {
                    setButtonClass("")
                    setButtonText("Save Settings")
                }, 1000);
        }
    };

    const handleChange = async (index) => {
        const updatedSettings = [...settings];

        // if(!updatedSettings[index].value && index === 1){
        //     darkMode.enable();
        // }else if(index === 1){
        //     darkMode.disable();
        // }

        updatedSettings[index].value = !updatedSettings[index].value;
        setSettings(updatedSettings);
        setButtonClass("")
        setButtonText("Save Settings")
    };



    return (
        <div className='settings-container'>
            {settings.map((setting, index) => (
                <div className="toggle-section" key={index}>
                    <div>{setting.label}</div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={setting.value}
                            onChange={() => handleChange(index)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            ))}

            <div className='save-settings-btn'>
                <button onClick={handleSaveSettings} className={buttonClass}>
                    <span>
                        {buttonClass === "success" && < ComposeIcon/>  }                         
                    {buttonText}</span>
                </button>

            </div>
        </div>
    );
};

export default Settings;
